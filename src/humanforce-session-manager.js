import * as crypto from 'crypto';
import Humanforce from 'humanforced/humanforce.js';

/**
 * Map of authentication hashes to Humanforce sessions
 *
 * @type {{}}
 */
const sessions = {};

// Salt can be random each time we run the server because it's only used to salt in-memory data
const salt = crypto.randomBytes(16).toString('hex');

/**
 * Get a Humanforce session for given credentials.
 * This will either retrieve and test a session stored in memory, or login to Humanforce to create a new session.
 *
 * @param {string} email
 * @param {string} password
 * @return {Promise<Humanforce>}
 */
export default async function getSession(email, password) {
    // We hash the username and password just to make them less readily accessible in memory. Probably overkill but can't hurt.
    const hash = crypto.createHash('sha512')
        .update(email + ':' + password + ':' + salt, 'utf-8')
        .digest('hex');

    let session = sessions[hash];

    if (session && !await session.testSession()) {
        // Session invalid
        console.log(`Session for ${email} invalid.`)
        delete sessions[hash];
        session = undefined;
    }

    if (!session) {
        // New session
        console.log(`Logging into Humanforce as ${email}...`);
        session = new Humanforce();
        await session.login(email, password);
    }

    sessions[hash] = session;
    return session;
}

