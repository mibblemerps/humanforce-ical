import * as querystring from 'querystring';
import * as crypto from 'crypto';
import {decrypt, encrypt} from './encrypt.js';

const KEY = process.env.KEY;
if (!KEY) throw new Error('No encryption key provided! Please define a KEY in .env!');

function deriveKey(keyString) {
    return crypto.pbkdf2Sync(keyString, '.', 100000, 32, 'sha512');
}

const derivedKey = deriveKey(KEY);

export function generate(email, password, options = {}) {
    const json = JSON.stringify({
        email: email,
        password: password,
        options: options
    });
    if (json.length > 1024) throw new Error('Too much data');

    const blob = encrypt(Buffer.from(json), derivedKey);

    return querystring.stringify({
        key: blob.toString('base64url')
    });
}

export function parse(queryString) {
    const query = querystring.parse(queryString);
    return JSON.parse(decrypt(Buffer.from(query.key.toString(), 'base64url'), derivedKey).toString('utf-8'));
}

