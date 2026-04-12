const WS_URL = 'wss://rideshare-backend-production-32f5.up.railway.app';
let ws = null;

export const connectWebSocket = (userId, onMessage) => {
  try {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      console.log('WebSocket connected!');
      ws.send(JSON.stringify({ type: 'register', userId }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) { console.error('WS message error:', e); }
    };
    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(() => connectWebSocket(userId, onMessage), 3000);
    };
    ws.onerror = (e) => { console.error('WebSocket error:', e); };
  } catch (e) { console.error('WebSocket connection error:', e); }
};

export const disconnectWebSocket = () => {
  if (ws) { ws.close(); ws = null; }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title, body, icon = '/logo.png') => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon, badge: icon });
};

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered!');
  } catch (e) { console.error('SW registration failed:', e); }
};