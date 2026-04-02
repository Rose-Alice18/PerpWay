const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client = null;
let isReady = false;

const initWhatsApp = () => {
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    console.log('\n📱 WhatsApp QR Code - Scan with your Perpway WhatsApp number:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp client is ready');
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.log('❌ WhatsApp disconnected:', reason);
  });

  client.initialize();
};

// Send a message to all configured WhatsApp groups
const sendRideAlert = async (ride) => {
  if (!isReady || !client) {
    console.log('⚠️ WhatsApp not ready — skipping group notification');
    return;
  }

  const groupIds = (process.env.WHATSAPP_GROUP_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  if (groupIds.length === 0) {
    console.log('⚠️ No WhatsApp group IDs configured in WHATSAPP_GROUP_IDS');
    return;
  }

  const message =
    `🚗 *New Ride Available on Perpway!*\n\n` +
    `📍 *From:* ${ride.pickupLocation}\n` +
    `📍 *To:* ${ride.destination}\n` +
    `📅 *Date:* ${ride.departureDate}\n` +
    `⏰ *Time:* ${ride.departureTime}\n` +
    `💺 *Seats Available:* ${ride.availableSeats}\n` +
    `👤 *Posted by:* ${ride.name}\n` +
    (ride.notes ? `📝 *Notes:* ${ride.notes}\n` : '') +
    `\n👉 Visit perpway.app to join this ride!`;

  for (const groupId of groupIds) {
    try {
      await client.sendMessage(groupId, message);
      console.log(`📨 WhatsApp alert sent to group: ${groupId}`);
    } catch (err) {
      console.error(`❌ Failed to send to group ${groupId}:`, err.message);
    }
  }
};

// List all groups the WhatsApp number is in (for finding group IDs)
const listGroups = async () => {
  if (!isReady || !client) return [];
  const chats = await client.getChats();
  return chats
    .filter(chat => chat.isGroup)
    .map(chat => ({ id: chat.id._serialized, name: chat.name }));
};

const getStatus = () => ({ isReady });

module.exports = { initWhatsApp, sendRideAlert, listGroups, getStatus };
