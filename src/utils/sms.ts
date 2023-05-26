import { Twilio } from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if Twilio credentials are set
if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_NUMBER) {
  throw new Error('Twilio credentials not found');
}

// Initialize Twilio client
const twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

/**
 * Send an SMS to a number
 */
export function sendSMS(to: string, message: string) {
  // Send SMS
  twilio.messages.create({ from: process.env.TWILIO_NUMBER, to: toUniversal(to), body: message });
}

/**
 * Convert a number to universal format
 */
function toUniversal(number: string) {
  // Remove all spaces
  number = number.replace(/\s/g, '');
  // Check if number is valid
  if (number[0] === '+') return number;
  if (number[0] === '0') return '+63' + number.substring(1);
  return '+63' + number;
}
