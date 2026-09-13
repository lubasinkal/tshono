export interface SampleJob {
  id: string
  title: string
  company: string
  sector: string
  location: string
  posted: string
  closing: string
  minYears: number
  blurb: string
  url: string
}

export const SECTORS = [
  'Finance',
  'Tech',
  'Health',
  'Education',
  'Retail',
  'Tourism',
  'Mining',
  'NGO',
  'General',
] as const

export const LOCATIONS = [
  'Gaborone',
  'Francistown',
  'Maun',
  'Jwaneng',
  'Letlhakane',
  'Palapye',
  'Kasane',
  'Serowe',
  'Remote',
  'Botswana',
] as const

export const sampleJobs: SampleJob[] = [
  { id: 'j001', title: 'Graduate Data Analyst', company: 'Absa Botswana', sector: 'Finance', location: 'Gaborone', posted: '2026-09-12', closing: '2026-09-30', minYears: 0, blurb: 'Build dashboards for retail risk. Excel plus SQL plus one charting tool. Mentor provided.', url: 'https://example.com/j001' },
  { id: 'j002', title: 'Junior Risk Analyst', company: 'First National Bank Botswana', sector: 'Finance', location: 'Gaborone', posted: '2026-09-11', closing: '2026-09-28', minYears: 1, blurb: 'Support credit risk scoring and monthly provision packs. Actuarial students welcome.', url: 'https://example.com/j002' },
  { id: 'j003', title: 'Frontend Developer (Nuxt)', company: 'Digital Delta', sector: 'Tech', location: 'Gaborone', posted: '2026-09-12', closing: '2026-10-05', minYears: 1, blurb: 'Ship fast pages with Nuxt and Bun. Instant search experience a plus.', url: 'https://example.com/j003' },
  { id: 'j004', title: 'Nurse (Enrolled)', company: 'Princess Marina Hospital', sector: 'Health', location: 'Gaborone', posted: '2026-09-08', closing: '2026-09-25', minYears: 2, blurb: 'Ward cover plus clinic rotation. BQA registered certificate required.', url: 'https://example.com/j004' },
  { id: 'j005', title: 'Maths Teacher (Senior School)', company: 'Enko Botho', sector: 'Education', location: 'Gaborone', posted: '2026-09-10', closing: '2026-10-01', minYears: 2, blurb: 'Teach IGCSE maths plus stats club. Past paper coaching experience valued.', url: 'https://example.com/j005' },
  { id: 'j006', title: 'Shop Assistant', company: 'Choppies Supermarket', sector: 'Retail', location: 'Francistown', posted: '2026-09-12', closing: '2026-09-24', minYears: 0, blurb: 'Till plus stocking plus customer help. Weekend shifts shared fairly.', url: 'https://example.com/j006' },
  { id: 'j007', title: 'Safari Lodge Front Office', company: 'Okavango River Lodge', sector: 'Tourism', location: 'Maun', posted: '2026-09-09', closing: '2026-09-29', minYears: 1, blurb: 'Guest check in plus bookings plus upsell of activities. Hospitality heart needed.', url: 'https://example.com/j007' },
  { id: 'j008', title: 'Engineering Manager', company: 'Lucara Botswana', sector: 'Mining', location: 'Letlhakane', posted: '2026-09-05', closing: '2026-09-30', minYears: 7, blurb: 'Lead plant engineering at Karowe. Safety first leadership record required.', url: 'https://example.com/j008' },
  { id: 'j009', title: 'M and E Assistant', company: 'UNDP Botswana', sector: 'NGO', location: 'Gaborone', posted: '2026-09-11', closing: '2026-09-26', minYears: 1, blurb: 'Track youth programme indicators. Kobo plus Excel plus field visits.', url: 'https://example.com/j009' },
  { id: 'j010', title: 'Actuarial Analyst (Life)', company: 'Botswana Life', sector: 'Finance', location: 'Gaborone', posted: '2026-09-12', closing: '2026-10-10', minYears: 1, blurb: 'Reserving support plus experience analysis. Progress with actuarial exams expected.', url: 'https://example.com/j010' },
  { id: 'j011', title: 'Backend Developer (Go)', company: 'Lubasiverse Labs', sector: 'Tech', location: 'Remote', posted: '2026-09-12', closing: '2026-10-15', minYears: 2, blurb: 'Build valuation APIs in Go. Zero dependency style. Show your GitHub.', url: 'https://example.com/j011' },
  { id: 'j012', title: 'Pharmacy Technician', company: 'Clicks Pharmacy', sector: 'Health', location: 'Gaborone', posted: '2026-09-07', closing: '2026-09-23', minYears: 1, blurb: 'Dispense support plus stock counts plus medical aid claims.', url: 'https://example.com/j012' },
  { id: 'j013', title: 'Primary Teacher', company: 'Westwood International', sector: 'Education', location: 'Gaborone', posted: '2026-09-06', closing: '2026-09-27', minYears: 2, blurb: 'Lower primary with phonics strength. Small classes, big heart.', url: 'https://example.com/j013' },
  { id: 'j014', title: 'Warehouse Picker', company: 'Bolux Group', sector: 'Retail', location: 'Gaborone', posted: '2026-09-12', closing: '2026-09-22', minYears: 0, blurb: 'Pick plus pack plus load. Forklift licence a plus but training given.', url: 'https://example.com/j014' },
  { id: 'j015', title: 'Tour Guide (Okavango)', company: 'Desert and Delta', sector: 'Tourism', location: 'Maun', posted: '2026-09-04', closing: '2026-09-28', minYears: 2, blurb: 'Licensed poler plus walking guide. First aid current.', url: 'https://example.com/j015' },
  { id: 'j016', title: 'CCTV Operator', company: 'Okavango Diamond Company', sector: 'Mining', location: 'Gaborone', posted: '2026-09-10', closing: '2026-09-24', minYears: 2, blurb: 'Monitor control room plus incident logs. Security clearance required.', url: 'https://example.com/j016' },
  { id: 'j017', title: 'Driver (Code B)', company: 'Botswana Post', sector: 'Retail', location: 'Palapye', posted: '2026-09-11', closing: '2026-09-25', minYears: 2, blurb: 'Mail routes plus parcel drops. Clean licence plus PDP.', url: 'https://example.com/j017' },
  { id: 'j018', title: 'Research Analyst', company: 'Bank of Botswana', sector: 'Finance', location: 'Gaborone', posted: '2026-09-09', closing: '2026-10-03', minYears: 2, blurb: 'Macro notes plus data packs. R or Python for charts.', url: 'https://example.com/j018' },
  { id: 'j019', title: 'IT Support Intern', company: 'Mascom Wireless', sector: 'Tech', location: 'Gaborone', posted: '2026-09-12', closing: '2026-09-26', minYears: 0, blurb: 'Helpdesk plus device setup plus ticket notes. Learn fast environment.', url: 'https://example.com/j019' },
  { id: 'j020', title: 'Enrolled Nurse (Mine Clinic)', company: 'Debswana Jwaneng', sector: 'Health', location: 'Jwaneng', posted: '2026-09-08', closing: '2026-09-29', minYears: 3, blurb: 'Occupational health plus emergency cover. Shift roster.', url: 'https://example.com/j020' },
  { id: 'j021', title: 'Lecturer (Statistics)', company: 'Botho University', sector: 'Education', location: 'Gaborone', posted: '2026-09-10', closing: '2026-10-08', minYears: 3, blurb: 'Teach intro stats plus supervise projects. Masters preferred.', url: 'https://example.com/j021' },
  { id: 'j022', title: 'Cashier (Forecourt)', company: 'Puma Energy', sector: 'Retail', location: 'Kasane', posted: '2026-09-11', closing: '2026-09-23', minYears: 0, blurb: 'Fuel plus shop sales. Honest hands, quick smile.', url: 'https://example.com/j022' },
  { id: 'j023', title: 'Chef de Partie', company: 'Cresta Lodge', sector: 'Tourism', location: 'Kasane', posted: '2026-09-07', closing: '2026-09-27', minYears: 3, blurb: 'Run a section plus train juniors. Safari volumes, calm head.', url: 'https://example.com/j023' },
  { id: 'j024', title: 'Pit Foreman', company: 'Mookane Coal', sector: 'Mining', location: 'Palapye', posted: '2026-09-06', closing: '2026-09-26', minYears: 5, blurb: 'Lead shift crews plus safety talks plus production logs.', url: 'https://example.com/j024' },
  { id: 'j025', title: 'Finance Intern', company: 'Stanbic Botswana', sector: 'Finance', location: 'Gaborone', posted: '2026-09-12', closing: '2026-09-30', minYears: 0, blurb: 'Recons plus data cleanup plus month end help. Excel power users shine.', url: 'https://example.com/j025' },
  { id: 'j026', title: 'DevOps Assistant', company: 'Botswana Fibre Networks', sector: 'Tech', location: 'Gaborone', posted: '2026-09-09', closing: '2026-10-02', minYears: 1, blurb: 'Help with deploys plus uptime boards plus log hunts. Docker basics enough.', url: 'https://example.com/j026' },
  { id: 'j027', title: 'Community Health Worker', company: 'Baylor Botswana', sector: 'Health', location: 'Serowe', posted: '2026-09-05', closing: '2026-09-24', minYears: 1, blurb: 'Home visits plus adherence support. Motorbike provided.', url: 'https://example.com/j027' },
  { id: 'j028', title: 'Science Teacher (Biology)', company: 'Moeng College', sector: 'Education', location: 'Serowe', posted: '2026-09-08', closing: '2026-09-28', minYears: 2, blurb: 'BGCSE biology plus lab care. Boarding duty shared.', url: 'https://example.com/j028' },
  { id: 'j029', title: 'Sales Rep (FMCG)', company: 'Trade World', sector: 'Retail', location: 'Francistown', posted: '2026-09-10', closing: '2026-09-27', minYears: 1, blurb: 'Van sales plus merchandising plus new outlet hunts. Target driven.', url: 'https://example.com/j029' },
  { id: 'j030', title: 'Housekeeper (Luxury Camp)', company: 'Wilderness Safaris', sector: 'Tourism', location: 'Maun', posted: '2026-09-11', closing: '2026-09-25', minYears: 1, blurb: 'Turndowns plus laundry plus guest delight. Bush roster 3 weeks on.', url: 'https://example.com/j030' },
  { id: 'j031', title: 'Underwriter (Short Term)', company: 'Hollard Botswana', sector: 'Finance', location: 'Gaborone', posted: '2026-09-07', closing: '2026-09-29', minYears: 2, blurb: 'Quote motor plus property lines. Binder discipline matters.', url: 'https://example.com/j031' },
  { id: 'j032', title: 'Data Capturer', company: 'Statistics Botswana', sector: 'NGO', location: 'Gaborone', posted: '2026-09-12', closing: '2026-09-22', minYears: 0, blurb: 'Short contract capturing survey returns. Speed plus accuracy tested.', url: 'https://example.com/j032' },
  { id: 'j033', title: 'Electrician (Plant)', company: 'Morupule Coal Mine', sector: 'Mining', location: 'Palapye', posted: '2026-09-09', closing: '2026-09-30', minYears: 4, blurb: 'Preventive maintenance plus fault finding. Trade tested.', url: 'https://example.com/j033' },
  { id: 'j034', title: 'HR Officer', company: 'Botswana Railways', sector: 'NGO', location: 'Gaborone', posted: '2026-09-06', closing: '2026-09-27', minYears: 3, blurb: 'Recruitment plus leave plus disciplinary notes. HRIS tidy habits.', url: 'https://example.com/j034' },
  { id: 'j035', title: 'Graduate Trainee (Network)', company: 'BTC Botswana', sector: 'Tech', location: 'Gaborone', posted: '2026-09-11', closing: '2026-10-06', minYears: 0, blurb: 'Rotate across NOC plus field plus planning. Recent grads welcome.', url: 'https://example.com/j035' },
  { id: 'j036', title: 'Accounts Clerk', company: 'Sefalana Holdings', sector: 'Finance', location: 'Gaborone', posted: '2026-09-10', closing: '2026-09-26', minYears: 1, blurb: 'Creditors plus age analysis plus payment runs. Pastel or SAP a plus.', url: 'https://example.com/j036' },
]
