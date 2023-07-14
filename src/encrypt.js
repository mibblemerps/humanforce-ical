import * as crypto from 'crypto';

export function generateKey() {
    return crypto.randomBytes(32);
}

/**
 *
 * @param {Buffer} data
 * @param key
 * @return {Buffer}
 */
export function encrypt(data, key) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]);
}

/**
 *
 * @param {Buffer} blob
 * @param key
 * @return {Buffer}
 */
export function decrypt(blob, key) {
    const iv = blob.subarray(0, 16);
    const tag = blob.subarray(16, 32);
    const data = blob.subarray(32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}