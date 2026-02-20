[![Version](https://img.shields.io/badge/Version-v1.0.0-orange)](https://github.com/fkeijzer/full-calendar-meeting-linker)

# Full Calendar (Meeting Note Edition)

> This is a custom fork of the [Full Calendar Remastered](https://github.com/YouFoundJK/plugin-full-calendar) plugin by Jovi Koikkara, which was based on the original work by [Davis Haupt](https://davi.sh/).

## Enhancements in this Fork
This version was specifically modified by **Flip Keijzer** to bridge the gap between read-only Outlook/iCal calendars and Obsidian notes.

- **Stable UID Linking:** Uses the unique Outlook UID to link events to notes. You can now rename or move your notes within your vault without breaking the link to the calendar event.
- **Automated Meeting Notes:** Added a "Notes" button to the event details modal for all calendars. It automatically creates a structured meeting note in your `/Meetings` folder.
- **Outlook Timezone Support:** Fixed common "Invalid Timezone" errors by mapping Windows/Outlook identifiers (like *Romance Standard Time*) to IANA standards.
- **Polished UI:** Aligned the "Notes" and "Close" buttons in the event modal to match Obsidian's native design language.

## Installation
1. Download the latest `main.js`, `manifest.json`, and `styles.css` from the [releases page](https://github.com/fkeijzer/full-calendar-meeting-linker/releases).
2. Create a folder named `full-calendar-meeting-linker` in your `.obsidian/plugins/` directory.
3. Place the downloaded files in that folder and restart Obsidian.

---

The FullCalendar library is released under the [GPLv3 license](https://fullcalendar.io/license).