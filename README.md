# Praveena & Jibin — Engagement Invitation

24 January 2027, 11:00 AM IST. Carnation Convention Centre, Angamaly, Kerala.

Open `index.html` directly or serve this directory with `python3 -m http.server 4173`. No installation or build is required. Fonts and the Google Maps embed need internet access.

Includes an opening envelope, floral stationery, music, countdown, calendar download, engagement details, FAQs, gallery, and venue map. There is no RSVP or guest collection.

## Add the couple’s photographs

Put supplied photographs in `assets/photos/` and list each in `photos.js`:

```js
window.invitationPhotos = [
  { src: 'assets/photos/01.jpg', alt: 'Praveena and Jibin together' },
  { src: 'assets/photos/02.jpg', alt: 'Praveena and Jibin celebrating' }
];
```

Until photos are supplied, the gallery displays a simple announcement instead of unrelated pictures. Once configured, photos rotate every five seconds while the gallery is visible. Rotation pauses on hover, keyboard focus, when viewing a photo, or when the page is hidden. Reduced-motion users start with rotation paused. Tap a photo for a full-screen view; use previous/next, keyboard arrows, or Escape to close.

The map uses the venue name and locality. Get Directions opens Google Maps with the destination set and the origin omitted so Maps uses the guest’s current location where available; otherwise the guest can enter a starting point.

Update the date in `index.html`, `script.js`, and `wedding.ics` together. The calendar specifies the start time only because the event end time has not been supplied.

Background music was copied from the original supplied project. Floral artwork was generated. Original projects and reference videos remain unchanged. No Git write commands were run.
