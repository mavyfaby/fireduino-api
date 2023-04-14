import { isTelPhone } from "./string";

/**
 * Validate inputs
 */
export function validateEntity(name: string, phone: string, address: string, latitude: string, longitude: string) {
  if (name.length === 0) return "Name is required";
  if (phone.length === 0) return "Phone is required";
  if (!isTelPhone(phone)) return "Must be a valid telephone number";
  if (address.length === 0) return "Address is required";

  // TODO: Validate latitude and longitude if it's in range

  if (latitude.length === 0) return "Latitude is required";
  if (isNaN(Number(latitude))) return "Latitude must be a number";
  if (longitude.length === 0) return "Longitude is required";
  if (isNaN(Number(longitude))) return "Longitude must be a number";

  return "";
}
