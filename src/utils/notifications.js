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
  } catch (e) {
    console.error('SW registration failed:', e);
  }
};