// src\lib\sms.ts
import "server-only";

export async function sendSMS(to: string, message: string) {
  console.log(`[📱 SMS] To: ${to}`);
  console.log(`[💬 Message]: ${message}`);
  return { success: true };
}
