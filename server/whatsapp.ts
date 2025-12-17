// Free WhatsApp Web API - No API key needed
// Uses WhatsApp Web URL scheme to send messages

export function sendWhatsAppMessage(phone: string, message: string): string {
  // Remove any non-digit characters and ensure it starts with country code
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp Web URL
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateDailyReminderMessage(goal: string, todayNote?: string): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let message = `🎯 *Daily Goal Reminder*\n\n`;
  message += `📅 ${today}\n\n`;
  message += `*Your Goal:* ${goal}\n\n`;
  
  if (todayNote) {
    message += `📝 *Today's Note:* ${todayNote}\n\n`;
  }
  
  message += `✅ Don't forget to mark today as complete!\n\n`;
  message += `Keep going! 💪`;
  
  return message;
}

// Schedule daily reminders (can be called from a cron job)
export function scheduleDailyReminder(phone: string, goal: string, todayNote?: string) {
  const message = generateDailyReminderMessage(goal, todayNote);
  const whatsappUrl = sendWhatsAppMessage(phone, message);
  
  // In production, you would:
  // 1. Use a cron job to call this at specific times
  // 2. Store the URL in database
  // 3. Send via email or SMS with the WhatsApp link
  // 4. Or integrate with WhatsApp Business API (paid)
  
  return whatsappUrl;
}
