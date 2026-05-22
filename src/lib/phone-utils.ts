import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

/**
 * Build an E.164 phone number from a country code and local phone number.
 * Strips leading zeros from the local number.
 *
 * @example buildE164PhoneNumber("MY", "0123456789") → "+60123456789"
 */
export function buildE164PhoneNumber(country: string, phone: string): string {
  try {
    const callingCode = getCountryCallingCode(country as CountryCode);
    const cleanPhone = phone.replace(/^0+/, "");
    return `+${callingCode}${cleanPhone}`;
  } catch {
    return phone;
  }
}
