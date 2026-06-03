import { db } from './db';
import { userDevices, users, adminWebPushSubscriptions } from '../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { sendPushNotification } from './firebase';

export async function notifyUser(
  userId: number,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    console.log(`🔔 notifyUser: Sending notification to user ${userId}`);
    const devices = await db.select().from(userDevices)
      .where(and(eq(userDevices.userId, userId), eq(userDevices.isActive, true)));
    
    const tokens = devices.map(d => d.fcmToken).filter(Boolean);
    console.log(`🔔 notifyUser: Found ${tokens.length} active devices for user ${userId}`);
    
    if (tokens.length > 0) {
      const result = await sendPushNotification(tokens, title, body, undefined, data);
      console.log(`🔔 notifyUser result: ${result.successCount} success, ${result.failureCount} failed`);
      if (result.errors.length > 0) {
        console.log(`🔔 notifyUser errors:`, result.errors);
      }
    } else {
      console.log(`🔔 notifyUser: No active devices found for user ${userId}`);
    }
  } catch (error) {
    console.error('Failed to send notification to user:', userId, error);
  }
}

export async function notifyUsers(
  userIds: number[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    if (userIds.length === 0) return;
    
    const devices = await db.select().from(userDevices)
      .where(and(inArray(userDevices.userId, userIds), eq(userDevices.isActive, true)));
    
    const tokens = devices.map(d => d.fcmToken).filter(Boolean);
    
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, body, undefined, data);
    }
  } catch (error) {
    console.error('Failed to send notifications to users:', userIds, error);
  }
}

export async function notifyAdmins(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    // Get admin mobile device tokens from userDevices
    const admins = await db.select({ id: users.id }).from(users)
      .where(eq(users.role, 'admin'));
    
    const adminIds = admins.map(a => a.id);
    
    // Collect all tokens
    const allTokens: string[] = [];
    
    // Get mobile device tokens
    if (adminIds.length > 0) {
      const mobileDevices = await db.select().from(userDevices)
        .where(and(inArray(userDevices.userId, adminIds), eq(userDevices.isActive, true)));
      allTokens.push(...mobileDevices.map(d => d.fcmToken).filter(Boolean));
    }
    
    // Get admin browser push tokens from adminWebPushSubscriptions
    const webSubscriptions = await db.select().from(adminWebPushSubscriptions);
    allTokens.push(...webSubscriptions.map(s => s.fcmToken).filter(Boolean));
    
    console.log(`🔔 notifyAdmins: Found ${allTokens.length} tokens (mobile + browser)`);
    
    if (allTokens.length > 0) {
      const result = await sendPushNotification(allTokens, title, body, undefined, data);
      console.log(`🔔 notifyAdmins result: ${result.successCount} success, ${result.failureCount} failed`);
    } else {
      console.log('🔔 notifyAdmins: No admin tokens found to send notifications');
    }
  } catch (error) {
    console.error('Failed to send notifications to admins:', error);
  }
}

export async function notifySupportMessage(
  ticketId: number,
  senderType: 'user' | 'admin',
  senderName: string,
  messagePreview: string,
  recipientUserId?: number
): Promise<void> {
  const truncatedMessage = messagePreview.length > 50 
    ? messagePreview.substring(0, 50) + '...' 
    : messagePreview;

  if (senderType === 'user') {
    await notifyAdmins(
      'New Support Message',
      `${senderName}: ${truncatedMessage}`,
      { type: 'support', ticketId: ticketId.toString() }
    );
  } else if (recipientUserId) {
    await notifyUser(
      recipientUserId,
      'Support Reply',
      `Admin: ${truncatedMessage}`,
      { type: 'support', ticketId: ticketId.toString() }
    );
  }
}

export async function notifyChatMessage(
  senderId: number,
  recipientId: number,
  senderName: string,
  messagePreview: string,
  conversationId: number
): Promise<void> {
  console.log(`🔔 notifyChatMessage: sender=${senderId}, recipient=${recipientId}, conversation=${conversationId}`);
  const truncatedMessage = messagePreview.length > 50 
    ? messagePreview.substring(0, 50) + '...' 
    : messagePreview;

  await notifyUser(
    recipientId,
    `Message from ${senderName}`,
    truncatedMessage,
    { type: 'chat', conversationId: conversationId.toString(), senderId: senderId.toString() }
  );
}

export async function notifySubscription(
  userId: number,
  eventType: 'subscribed' | 'renewed' | 'cancelled' | 'expired'
): Promise<void> {
  const messages: Record<string, { title: string; body: string }> = {
    subscribed: {
      title: 'Welcome to Premium!',
      body: 'Your subscription is now active. Enjoy all premium features!'
    },
    renewed: {
      title: 'Subscription Renewed',
      body: 'Your subscription has been successfully renewed.'
    },
    cancelled: {
      title: 'Subscription Cancelled',
      body: 'Your subscription has been cancelled. You can still access premium features until the end of your billing period.'
    },
    expired: {
      title: 'Subscription Expired',
      body: 'Your premium subscription has expired. Renew to continue enjoying premium features.'
    }
  };

  const msg = messages[eventType];
  if (msg) {
    await notifyUser(userId, msg.title, msg.body, { type: 'subscription', event: eventType });
  }
}

export async function notifyNewTicket(
  ticketSubject: string,
  userName: string
): Promise<void> {
  await notifyAdmins(
    'New Support Ticket',
    `${userName} opened a ticket: ${ticketSubject}`,
    { type: 'support_new' }
  );
}
