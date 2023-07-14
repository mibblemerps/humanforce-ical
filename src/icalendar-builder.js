export default class ICalendarBuilder {
    constructor() {
        this.text = '';
    }

    /**
     *
     * @param {string} line
     */
    append(line) {
        let key = undefined;
        let value = line;
        if (line.includes(':')) {
            key = line.substring(0, line.indexOf(':'));
            value = line.substring(line.indexOf(':') + 1);
        }
        value = value.replaceAll('\r\n', '\n') // normalize line endings
            .replaceAll('\\', '\\\\') // escape any backslashes
            .replaceAll(':', '\\:') // escape colons
            .replaceAll('\n', '\\n'); // convert actual new lines to escaped new lines
        line = (key ? (key + ':') : '') + value + '\r\n';

        // Insert line breaks to ensure we don't go over the 75 character line limit
        // we choose 72 here to account for the line breaks and tab character
        for (let i = 72; i < line.length; i += 72) {
            line = line.substring(0, i) + '\r\n\t' + line.substring(i);
        }

        this.text += line;
    }

    build() {
        return this.text;
    }
}
