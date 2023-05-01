import { isTelPhone } from "./string";

/**
 * Validate esablishment inputs
 */
export function validateEstablishment(name: string, phone: string, address: string, latitude: string, longitude: string, inviteKey: string) {
  if (inviteKey.length === 0) return "Invite key is required";
  return validateFireDepartment(name, phone, address, latitude, longitude);
}

/**
 * Validate fire department inputs
 */
export function validateFireDepartment(name: string, phone: string, address: string, latitude: string, longitude: string) {
  if (name.length === 0) return "Name is required";
  if (phone.length === 0) return "Phone is required";
  if (!isTelPhone(phone)) return "Must be a valid telephone number";
  if (address.length === 0) return "Address is required";

  if (latitude.length === 0) return "Latitude is required";
  if (longitude.length === 0) return "Longitude is required";

  return "";
}