# Dental Clinic bilingual PWA

## Patient experience
- Replace the placeholder home page with a polished Arabic-first clinic website, English toggle, correct RTL/LTR direction, clinic contact details, hours, and all eight requested services without prices.
- Add a real clinic photograph, booking form, appointment confirmation with calendar download, and a dedicated QR page with downloadable code.
- Make the site installable with a standalone manifest and dental app icons. Support Android install prompts, iPhone Safari instructions, installed-app detection, and guidance for in-app browsers; do not add offline caching.

## Doctor tools and data
- Use Lovable Cloud for persistent clinic settings, services, closures, bookings, patient profiles, and visit notes; protect doctor tools and records with server-validated sign-in and access policies. Keep authorization roles in a separate roles table.
- Enforce the two-patients-per-hour limit on the server, close Fridays and doctor-blocked dates, and provide doctor controls for bookings, statuses, notes, visit history, clinic details, services, and closures.
- Add immediate push notifications for new appointments and configurable advance reminders. Background push needs a Firebase messaging connection; scheduled reminders need a connected job scheduler. These integrations will be requested through their secure connection flows.

## Assumptions and technical notes
- Use Africa/Cairo as the clinic time zone based on the supplied address and working hours.
- Patient profile details must be available in the doctor's dashboard alongside contact details and visit history.
- Keep private health details limited to the protected doctor experience and enforce access in cloud policies, not just in the screen.
- Create dedicated page metadata for each page, including the home page and QR page.