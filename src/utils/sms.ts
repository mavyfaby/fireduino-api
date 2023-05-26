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
  twilio.messages.create({ from: process.env.TWILIO_NUMBER, to, body: message });
}
