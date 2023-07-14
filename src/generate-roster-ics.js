import Humanforce from 'humanforced/humanforce.js';
import Shift from 'humanforced/shift.js';
import * as crypto from 'crypto';
import ICalendarBuilder from './icalendar-builder.js';

/**
 * @param {Date} date
 * @return {string}
 */
function toIcalDate(date) {
    return date.getUTCFullYear() +
        (date.getUTCMonth() + 1).toString().padStart(2, '0') +
        date.getUTCDate().toString().padStart(2, '0') +
        'T' +
        date.getUTCHours().toString().padStart(2, '0') +
        date.getUTCMinutes().toString().padStart(2, '0') +
        date.getUTCSeconds().toString().padStart(2, '0') +
        'Z'; // Z on it's own denotes UTC
}

/**
 * Generate an ical from a given roster.
 *
 * @param {Humanforce} humanforce
 * @param options
 * @param {string} options.location
 * @param {number} options.reminderMins
 */
export default async function generate(humanforce, options) {
    options = options ?? {};

    const calendarName = humanforce.companyName + ' Roster';

    const roster = await humanforce.getCalendar();

    // ical header
    const ical = new ICalendarBuilder();
    ical.append('BEGIN:VCALENDAR');
    ical.append('VERSION:2.0');
    ical.append('PRODID:-//Mibble/HumanforceToIcal//EN');
    ical.append('X-PUBLISHED-TTL:PT1H');
    ical.append('REFRESH-INTERVAL:PT1H');
    ical.append(`X-WR-CALNAME:${calendarName}`);

    for (const shift of roster) {
        ical.append('BEGIN:VEVENT');
        ical.append(`UID:${shift.guid}`);
        ical.append(`DTSTAMP:${toIcalDate(shift.startTime)}`);
        ical.append(`DTSTART:${toIcalDate(shift.startTime)}`);
        ical.append(`DTEND:${toIcalDate(shift.endTime)}`);
        ical.append('STATUS:CONFIRMED');
        ical.append(`SUMMARY:${shift.role}`);
        ical.append(`DESCRIPTION:${shift.role}\n${shift.department}\n${shift.location}`)
        if (options.location) ical.append(`LOCATION:${options.location}`);
        if (options.reminderMins) {
            ical.append('BEGIN:VALARM');
            ical.append('ACTION:DISPLAY');
            ical.append(`TRIGGER:-PT${options.reminderMins}M`);
            ical.append('DESCRIPTION:Reminder');
            ical.append('END:VALARM');
        }
        ical.append('END:VEVENT');
    }

    ical.append('END:VCALENDAR');

    return ical.build();
}
