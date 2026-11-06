/* Fictional seed data for the portfolio demo. Every person, unit, vendor and log below is made up.
   Dates are relative to the day the demo is first opened, so the dashboard always looks current. */

const DEMO_USERS = {
  me: { id: 'demo-user', email: 'demo@harbourview.example', name: 'Alex Morgan' },
  jordan: { id: 'user-jordan', email: 'jordan.reyes@harbourview.example', name: 'Jordan Reyes' },
  priya: { id: 'user-priya', email: 'priya.nair@harbourview.example', name: 'Priya Nair' },
  sam: { id: 'user-sam', email: 'sam.okafor@harbourview.example', name: 'Sam Okafor' },
};

function buildDemoSeed() {
  const U = DEMO_USERS;
  const at = (offset, time) => new Date(`${dayOffset(offset)}T${time}:00`).toISOString();
  let n = 0;
  const id = (p) => `${p}-${String(++n).padStart(4, '0')}`;

  const occupant_report = [
    ['E0204', 'Marcus', 'Bellamy', 'Current'], ['E0204', 'Lena', 'Bellamy', 'Current'],
    ['E0307', 'Hiroshi', 'Tanaka', 'Current'], ['E0412', 'Camille', 'Duarte', 'Current'],
    ['E0515', 'Owen', 'Fitzgerald', 'Current'], ['E0515', 'Nadia', 'Fitzgerald', 'Current'],
    ['E0702', 'Theo', 'Lindqvist', 'Current'], ['E0809', 'Amara', 'Osei', 'Current'],
    ['E0811', 'Rafael', 'Mendes', 'Notice'], ['E0903', 'Grace', 'Whitfield', 'Current'],
    ['E1005', 'Daniel', 'Kowalski', 'Current'], ['E1008', 'Sofia', 'Marchetti', 'Future'],
    ['E1201', 'Benjamin', 'Ashford', 'Current'], ['E1304', 'Yara', 'Haddad', 'Current'],
    ['E1310', 'Elliot', 'Brennan', 'Current'], ['E1502', 'Mei', 'Chen', 'Current'],
    ['E1502', 'Lucas', 'Chen', 'Current'], ['E1607', 'Isabelle', 'Fournier', 'Current'],
    ['W0305', 'Kwame', 'Mensah', 'Current'], ['W0410', 'Harriet', 'Calloway', 'Current'],
    ['W0601', 'Diego', 'Navarro', 'Current'], ['W0708', 'Ingrid', 'Solberg', 'Notice'],
    ['W0812', 'Noah', 'Castellano', 'Current'], ['W0906', 'Leila', 'Farahani', 'Current'],
    ['W1102', 'Ethan', 'Prescott', 'Current'], ['W1207', 'Chloe', 'Vasquez', 'Future'],
    ['W1404', 'Aiden', 'Murphy', 'Current'], ['W1404', 'Rosa', 'Murphy', 'Current'],
    ['W1511', 'Tobias', 'Engel', 'Current'], ['W1803', 'Priyanka', 'Rao', 'Current'],
    ['W2006', 'Julian', 'Hartley', 'Current'], ['W2302', 'Anika', 'Sorensen', 'Current'],
  ].map(([unit, first_name, last_name, tenant_category]) => ({ id: id('occ'), unit, first_name, last_name, tenant_category, created_at: at(-60, '08:00') }));

  const log = (by, offset, shift, section, subtype, f = {}) => {
    const time = f.time || (shift === 'Morning' ? '09:30' : '15:30');
    return {
      id: id('log'), date: dayOffset(offset), shift, section, subtype,
      unit: f.unit || null, category: f.category || null, description: f.description || null,
      action_taken: f.action || null, pending_action: f.pending || null,
      guest_suite: f.suite || null, check_in: f.checkIn || null, details: f.details || {},
      created_by: by.id, created_by_email: by.email, created_at: at(offset, time), updated_at: at(offset, time),
    };
  };

  const shift_logs = [
    // Two days ago
    log(U.jordan, -2, 'Morning', 'operations_events', 'vendor_contractor', { unit: 'Brightway Cleaning', action: 'On site for cleaning.', description: 'Completed lobby glass and East mailroom.', time: '08:40' }),
    log(U.jordan, -2, 'Morning', 'residents_guests', 'resident', { unit: 'E0307 Hiroshi Tanaka', category: 'Package', description: 'Resident picked up oversized parcel from back office.', action: 'Signed out in the package log.', time: '10:05' }),
    log(U.priya, -2, 'Afternoon', 'amenities_common_areas', 'sky_lounge', { unit: 'Sky Lounge', description: 'Operational upon departure.', action: 'Reset furniture after private booking.', time: '16:20' }),
    log(U.priya, -2, 'Afternoon', 'resident_experience', 'resident_touchpoint', { unit: 'W0601 Diego Navarro', action: 'Called to check in; resident is settling in well and asked about bike storage.', details: { touchpoint: '30 Day' }, time: '17:10' }),

    // Yesterday
    log(U.sam, -1, 'Morning', 'operations_events', 'logs_trackers', { unit: 'Elevator OOS', action: 'West elevator 3 back in service at 9:15 after inspection.', time: '09:20' }),
    log(U.sam, -1, 'Morning', 'operations_events', 'vendor_contractor', { unit: 'PestGuard', action: 'On site for pest control in', description: 'Quarterly treatment in East and West garbage rooms.', time: '10:45' }),
    log(U.sam, -1, 'Morning', 'residents_guests', 'resident', { unit: 'W1404 Rosa Murphy', category: 'Access / keycard', description: 'Resident reported fob not working at the P1 garage door.', action: 'Reprogrammed fob; tested and working.', time: '11:30' }),
    log(U.me, -1, 'Afternoon', 'operations_events', 'guest_suite', { unit: 'E1502 Mei Chen', suite: 'E1104', checkIn: dayOffset(-1), action: 'Guest checked in, keycard issued.', details: { checkOut: dayOffset(2) }, time: '15:05' }),
    log(U.me, -1, 'Afternoon', 'welcome_gifts', 'welcome_gift', { unit: 'W1207 Chloe Vasquez', action: 'Placed in unit before move-in.', details: { gift: 'Move-in gift', giftStatus: 'Delivered' }, time: '16:00' }),
    log(U.me, -1, 'Afternoon', 'residents_guests', 'resident', { unit: 'E0811 Rafael Mendes', category: 'Move in / out', description: 'Resident asked to book the service elevator for move-out.', action: 'Booked West service elevator 9am–12pm.', pending: 'Confirm elevator padding is installed the morning of the move.', time: '17:25' }),
    log(U.jordan, -1, 'Afternoon', 'amenities_common_areas', 'west_chutes', { unit: 'West Chutes', description: 'Chute on floor 14 jammed.', action: 'Cleared blockage, posted reminder sign.', time: '18:40' }),

    // Today
    log(U.priya, 0, 'Morning', 'operations_events', 'logs_trackers', { unit: 'Snow Log', action: 'No new snowfall recorded overnight; walkways salted at 7:00.', time: '07:15' }),
    log(U.priya, 0, 'Morning', 'operations_events', 'vendor_contractor', { unit: 'Summit Elevators', action: 'On site for elevator:', description: 'East elevator 2 annual inspection.', pending: 'Confirm inspection certificate is posted in the cab.', time: '08:30' }),
    log(U.me, 0, 'Morning', 'residents_guests', 'resident', { unit: 'E0903 Grace Whitfield', category: 'Maintenance', description: 'Resident reported a slow leak under the kitchen sink.', action: 'Work order created for maintenance.', time: '09:10', details: { quickLine: 'e0903 leak under kitchen sink, work order created' } }),
    log(U.me, 0, 'Morning', 'resident_experience', 'resident_touchpoint', { unit: 'E1310 Elliot Brennan', action: 'Left a voicemail for the 75-day check-in.', details: { touchpoint: '75 Day' }, time: '10:20' }),
    log(U.me, 0, 'Morning', 'amenities_common_areas', 'curb_appeal', { unit: 'Curb Appeal', description: 'Front planters watered, entrance swept.', time: '10:50', details: { quickLine: 'curb appeal planters watered and entrance swept' } }),
    log(U.jordan, 0, 'Morning', 'operations_events', 'event', { unit: 'Matcha Workshop', action: 'Set up in the Dining / Boardroom for 6pm; 14 residents registered.', time: '11:35' }),
    log(U.jordan, 0, 'Morning', 'residents_guests', 'resident', { unit: 'W2302 Anika Sorensen', category: 'Guest / visitor', description: 'Visitor parking pass requested for the weekend.', action: 'Issued a 2-day pass through the parking portal.', time: '11:55' }),
  ];

  const fu = (by, f) => ({
    id: id('fu'), title: f.title, unit: f.unit || null, category: f.category || 'General', owner: f.owner || 'Concierge',
    assignee: f.assignee || null, due_date: dayOffset(f.due), priority: f.priority || 'Medium', status: f.status || 'Open',
    next_action: f.next || null, resolution: f.resolution || null,
    created_by: by.id, created_by_email: by.email, created_at: at(f.created ?? -1, '12:00'), updated_at: at(f.created ?? -1, '12:00'),
  });

  const followups = [
    fu(U.me, { title: 'Confirm elevator padding for move-out', unit: 'E0811 Rafael Mendes', category: 'Move in / out', due: 1, priority: 'High', next: 'Check with maintenance at start of shift.' }),
    fu(U.priya, { title: 'Fix leak under kitchen sink', unit: 'E0903 Grace Whitfield', category: 'Maintenance', owner: 'Maintenance', assignee: 'Sam Okafor', due: 0, priority: 'High', status: 'In progress', next: 'Plumber booked for 2pm.', created: 0 }),
    fu(U.jordan, { title: 'Replace burnt-out light in P2 stairwell', category: 'Maintenance', owner: 'Maintenance', due: -2, priority: 'Medium', created: -4 }),
    fu(U.sam, { title: 'Send renewal offer', unit: 'W0708 Ingrid Solberg', category: 'Leasing', owner: 'Leasing', due: 3, priority: 'Medium', status: 'Waiting', next: 'Waiting on rate approval.' }),
    fu(U.me, { title: 'Follow up on 75-day check-in voicemail', unit: 'E1310 Elliot Brennan', category: 'Resident request', due: 2, priority: 'Low', created: 0 }),
    fu(U.priya, { title: 'Order replacement yoga mats', category: 'Amenity booking', owner: 'Property Management', due: 5, priority: 'Low' }),
    fu(U.jordan, { title: 'Noise complaint follow-up', unit: 'W1511 Tobias Engel', category: 'Noise / complaint', owner: 'Property Management', due: -1, priority: 'High', next: 'Send a courtesy letter to the unit above.', created: -3 }),
    fu(U.me, { title: 'Return FedEx parcel for resident', unit: 'E0307 Hiroshi Tanaka', category: 'Package', due: -3, priority: 'Medium', status: 'Done', resolution: 'Picked up by FedEx; tracking number given to resident.', created: -5 }),
  ];

  const notices = [
    { id: id('ntc'), text: 'Fire alarm testing in the West tower on Thursday, 10am–2pm.', date: dayOffset(0), created_at: at(0, '07:30') },
    { id: id('ntc'), text: 'Pool deck closed for resurfacing until next Monday.', date: dayOffset(-1), created_at: at(-1, '08:00') },
  ];

  const res = (group_name, name, notes, tags) => ({
    id: id('res'), group_name, name, url: `https://example.com/${slugify(name)}`, notes, tags, created_at: at(-30, '09:00'),
  });
  const resources = [
    res('Work systems', 'PropertyHub', 'Resident records, work orders and occupant reports.', 'residents, work orders'),
    res('Work systems', 'Resident App', 'Amenity bookings and building announcements.', 'bookings, announcements'),
    res('Work systems', 'Parcel Lockers', 'Package locker admin and resident notifications.', 'packages'),
    res('Work systems', 'Access Control', 'Fob programming and door schedules.', 'fobs, keycards'),
    res('Work systems', 'Parking Portal', 'Visitor passes and parking permits.', 'parking, visitors'),
    res('Work systems', 'SharePoint', 'Team site with trackers and SOPs.', 'documents'),
    res('SharePoint trackers', 'Guest Suite', 'Bookings, check-in and check-out dates.', 'guest suite'),
    res('SharePoint trackers', 'Guest Keycard', 'Temporary keycards issued to guests.', 'keycards'),
    res('SharePoint trackers', 'Live Events', 'Upcoming resident events and sign-ups.', 'events'),
    res('SharePoint trackers', 'Corporate Stays', 'Furnished corporate stays and contacts.', 'corporate'),
    res('SharePoint trackers', 'Elevator OOS', 'Out-of-service log for all elevators.', 'elevators'),
    res('SOPs', 'Package Handling SOP', 'Receiving, storing and releasing parcels.', 'packages'),
    res('SOPs', 'Move In / Out SOP', 'Elevator bookings, padding and deposits.', 'moves, elevators'),
    res('Guides & tips', 'Shift Note Style Guide', 'How to write a clear handover note.', 'shift note'),
    res('Contacts', 'After-hours Emergency Line', 'For floods, lockouts and fire alarms after 6pm.', 'emergency'),
  ];

  return { occupant_report, shift_logs, followups, notices, resources, app_admins: [{ user_id: U.me.id }] };
}
