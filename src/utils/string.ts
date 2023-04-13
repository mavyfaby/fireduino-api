/**
 * Check if a string is a valid telephone or mobile number
 */
export function isTelPhone(phone: string) {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
}