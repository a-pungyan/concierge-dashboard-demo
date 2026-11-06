# Concierge Dashboard (portfolio demo)

A dashboard for a residential building's concierge team. It puts shift logs, follow-ups, notices and resource links in one place, and it turns a shift's activity into a ready-to-send handover note.

**This is a portfolio version.** Every resident, unit, vendor, staff member and log entry is fictional. The production app uses Supabase (Postgres, Auth, Row Level Security and an Edge Function that calls Claude). Here a small in-browser mock backend takes its place, so the demo runs with no account, server or API key.

## Run it

Open `index.html` in a browser and press **Sign in** (the demo login is filled in for you). There's no build step and nothing to install.

What you change is saved in your browser's local storage. **Reset demo** restores the sample data.

## Features

- **Overview:** the Quick log up front, one "Needs attention" list (overdue, due today, then high priority), today's shift activity, the day's to-dos, team notices, follow-ups coming up this week and pinned quick links, filterable by team (Concierge, Maintenance, Leasing, Property Management).
- **Quick log:** type one line, for example `bw on site for cleaning` or `e0903 leak under kitchen sink`. Keyword rules file it under the right shift note heading, and residents, vendors and areas are suggested as you type.
- **Tidy with Claude:** in production this sends the line to Claude Haiku to tidy the wording and confirm the heading. Resident names, emails and phone numbers are swapped for placeholders before the line leaves the browser. In the demo, the keyword rules simulate the response.
- **Shift log:** a two-step form (section, then type) for operations, vendors, guest suites, events, resident touchpoints, welcome gifts, resident requests and amenities.
- **Follow-ups:** owner team, assignee, due date, priority, status, next action and resolution. Overdue items are flagged, and an item can't be marked Done without a resolution.
- **Resources:** work systems, trackers, SOPs, guides and contacts, with tags. Pinned resources appear on the Overview.
- **Generate shift note:** builds a handover note grouped by section from the shift's logs and open follow-ups, ready to paste into email or Teams.
- **Search and filters:** global search plus filters on each tab.

Keyboard shortcuts: `/` search · `L` new shift log · `F` new follow-up · `N` shift note · `Esc` close or clear.

## How it's built

- Plain HTML, CSS and JavaScript with no framework and no build step.
- `app.js`: state, rendering, forms, search and the shift note generator.
- `quick-entry.js`: the Quick log parser (keyword matching, fuzzy name matching, guest suite paste import) and name redaction before AI calls.
- `data.js`: option lists, shift note sections and their form definitions.
- `mock-backend.js`: a Supabase-compatible client (`from().select/insert/update/delete`, `auth`, `functions.invoke`) backed by `localStorage`. The app code is the same as production.
- `seed-data.js`: the fictional sample data, dated relative to today.
- `supabase/functions/quick-log-ai/`: the production Edge Function that calls Claude with a JSON-schema structured output. It's included for reference and isn't used by the demo.

In production, access rules are enforced in the database with Row Level Security. Only a log's author or an admin can edit or delete it, anyone signed in can update follow-ups, and only admins can manage resources.
