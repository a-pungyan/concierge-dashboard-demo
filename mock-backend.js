/* Demo backend: a small stand-in for the Supabase client that keeps everything in this browser.
   It supports the calls app.js makes (select / insert / update / delete with eq, order, range,
   limit and single; password sign-in; and the quick-log-ai function), so the app code is the
   same as the production version. Data is seeded from seed-data.js on first load. */

(function () {
  const DB_KEY = 'concierge-demo-db-v1';
  const SESSION_KEY = 'concierge-demo-session-v1';
  const LATENCY = 120; // ms, so loading states are visible like a real network

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  let memory = null; // fallback when localStorage is unavailable
  function loadDb() {
    if (memory) return memory;
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return (memory = JSON.parse(raw));
    } catch (_) { /* fall through to a fresh seed */ }
    memory = buildDemoSeed();
    saveDb();
    return memory;
  }
  function saveDb() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(memory)); } catch (_) { /* in-memory only */ }
  }

  function currentSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; }
  }

  class Query {
    constructor(table) {
      this.table = table;
      this.op = 'select';
      this.cols = '*';
      this.filters = [];
      this.orders = [];
      this.from = 0;
      this.to = Infinity;
      this.isSingle = false;
    }
    select(cols = '*') { if (this.op === 'select') this.cols = cols; return this; }
    insert(rows) { this.op = 'insert'; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
    update(values) { this.op = 'update'; this.payload = values; return this; }
    delete() { this.op = 'delete'; return this; }
    eq(col, val) { this.filters.push([col, val]); return this; }
    order(col, { ascending = true } = {}) { this.orders.push([col, ascending]); return this; }
    range(from, to) { this.from = from; this.to = to; return this; }
    limit(n) { this.to = this.from + n - 1; return this; }
    single() { this.isSingle = true; return this; }
    then(resolve, reject) { return this.run().then(resolve, reject); }

    async run() {
      await sleep(LATENCY);
      const session = currentSession();
      if (!session) return { data: null, error: { message: 'not authenticated' } };
      const db = loadDb();
      const rows = (db[this.table] = db[this.table] || []);
      const match = (r) => this.filters.every(([c, v]) => r[c] === v);
      let out;

      if (this.op === 'insert') {
        const now = new Date().toISOString();
        out = this.payload.map((r) => ({
          id: newId(), ...clone(r), created_at: now, updated_at: now,
          created_by: session.user.id, created_by_email: session.user.email,
        }));
        rows.push(...out);
        saveDb();
      } else if (this.op === 'update') {
        out = rows.filter(match);
        out.forEach((r) => Object.assign(r, clone(this.payload)));
        saveDb();
      } else if (this.op === 'delete') {
        out = rows.filter(match);
        db[this.table] = rows.filter((r) => !match(r));
        saveDb();
      } else {
        out = rows.filter(match);
        if (this.table === 'app_admins') out = out.filter((r) => r.user_id === session.user.id);
        const orders = this.orders.length ? this.orders : [];
        out = [...out].sort((a, b) => {
          for (const [c, asc] of orders) {
            const cmp = String(a[c] ?? '').localeCompare(String(b[c] ?? ''));
            if (cmp) return asc ? cmp : -cmp;
          }
          return 0;
        }).slice(this.from, this.to + 1);
        if (this.cols !== '*') {
          const keep = this.cols.split(',').map((s) => s.trim());
          out = out.map((r) => Object.fromEntries(keep.map((k) => [k, r[k]])));
        }
      }

      out = clone(out);
      if (this.isSingle) {
        if (out.length !== 1) return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
        return { data: out[0], error: null };
      }
      return { data: out, error: null };
    }
  }

  const listeners = [];
  const makeUser = (email) => {
    const known = Object.values(DEMO_USERS).find((u) => u.email === email) || DEMO_USERS.me;
    return { id: known.id, email: known.email, user_metadata: { display_name: known.name } };
  };

  const auth = {
    async getSession() { return { data: { session: currentSession() }, error: null }; },
    async getUser() { return { data: { user: currentSession()?.user || null }, error: null }; },
    async signInWithPassword({ email, password }) {
      await sleep(300);
      if (!email || !password) return { data: {}, error: { message: 'Invalid login credentials' } };
      // Demo: any email and password signs in as the demo concierge.
      const session = { user: makeUser(DEMO_USERS.me.email), access_token: 'demo' };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (_) { /* memory only */ }
      listeners.forEach((cb) => cb('SIGNED_IN', session));
      return { data: { session }, error: null };
    },
    async signOut() {
      try { localStorage.removeItem(SESSION_KEY); } catch (_) { /* ignore */ }
      listeners.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },
    onAuthStateChange(cb) {
      listeners.push(cb);
      return { data: { subscription: { unsubscribe: () => listeners.splice(listeners.indexOf(cb), 1) } } };
    },
  };

  /* Simulates the quick-log-ai edge function with the local keyword rules, so the
     "Tidy with Claude" review flow can be shown without an API key. */
  const functions = {
    async invoke(name, { body } = {}) {
      await sleep(700);
      if (name !== 'quick-log-ai') return { data: null, error: { message: 'Not found', context: { status: 404 } } };
      const dest = body.fixed_destination || body.keyword_guess || 'residents_guests/resident';
      const fields = quickFields(dest, body.line, []);
      const main = fields[quickMainField(dest)] || body.line;
      const text = tidySentence(main) || main;
      const entityTypes = ['vendor_contractor', 'logs_trackers', 'event', 'area'];
      return {
        data: {
          destination: dest,
          entity: entityTypes.includes(dest.split('/')[1]) ? fields.unit || '' : '',
          text,
          booked_by: '',
          touchpoint: fields.touchpoint || '',
          gift: fields.gift || '',
          gift_status: fields.giftStatus || '',
          category: fields.category || '',
        },
        error: null,
      };
    },
  };

  window.supabase = { createClient: () => ({ from: (t) => new Query(t), auth, functions }) };

  window.resetDemoData = () => {
    try { localStorage.removeItem(DB_KEY); } catch (_) { /* ignore */ }
    memory = null;
    location.reload();
  };

  document.getElementById('reset-demo-btn')?.addEventListener('click', () => {
    if (confirm('Restore the original sample data? Changes you made in this demo will be lost.')) window.resetDemoData();
  });
})();
