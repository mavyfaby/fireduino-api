/**
 * Check if a string is a valid telephone or mobile number
 */
export function isTelPhone(phone: string) {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
}

/**
 * Encode a string to base64 without padding
 */
export function tb64(text: string) {
  return Buffer.from(text).toString("base64").replace(/=/g, '');
}

/**
* Decode a string from base64
*/
export function rb64(text: string) {
  return Buffer.from(text, 'base64').toString("ascii");
}
