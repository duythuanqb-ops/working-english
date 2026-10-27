import { storageService } from './storageService';

/**
 * notificationService
 * Manages desktop notifications and scheduled study reminders
 * Supports Electron native notifications and Web Notification API fallback.
 */

export const notificationService = {
  isSupported: () => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.sendNotification === 'function') {
      return true;
    }
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  requestPermission: async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      try {
        return await Notification.requestPermission();
      } catch (err) {
        console.warn('Notification permission request failed:', err);
      }
    }
    return 'granted';
  },

  sendNotification: async ({ title = 'WorkingEnglish', body = 'Đã đến giờ ôn tập tiếng Anh hôm nay!' }) => {
    // 1. Try Electron native notification first
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.sendNotification === 'function') {
      try {
        const res = await window.electronAPI.sendNotification({ title, body });
        if (res && res.success) return true;
      } catch (err) {
        console.warn('Electron notification failed, attempting web fallback:', err);
      }
    }

    // 2. Fallback to Web Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/assets/logo-finall.webp',
            tag: 'we-study-reminder'
          });
          return true;
        } catch (err) {
          console.warn('Web notification failed:', err);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(title, { body, icon: '/assets/logo-finall.webp' });
          }
        });
      }
    }
    return false;
  },

  checkDailyReminder: async (words = [], streak = 0) => {
    try {
      const settings = storageService.getSettings();
      if (!settings.reminderEnabled || !settings.reminderTime) return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentH}:${currentM}`;

      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const lastSent = localStorage.getItem('we_last_reminder_date');

      // Check if current time has reached or passed scheduled reminder time and hasn't fired yet today
      if (currentTime >= settings.reminderTime && lastSent !== today) {
        const dueWords = words.filter((w) => (w.box || 1) <= 2);
        const dueCount = dueWords.length;

        const title = 'WorkingEnglish · Giờ ôn tập hàng ngày! 🔥';
        const body = dueCount > 0
          ? `Bạn có ${dueCount} từ vựng cần ôn lại theo chu kỳ Leitner. Ôn ngay để giữ chuỗi Streak ${streak} ngày nhé!`
          : `Đã đến giờ học hôm nay! Dành 5 phút luyện tập để duy trì chuỗi Streak ${streak} ngày nhé!`;

        const sent = await notificationService.sendNotification({ title, body });
        if (sent) {
          localStorage.setItem('we_last_reminder_date', today);
        }
      }
    } catch (err) {
      console.error('Failed to run daily reminder check:', err);
    }
  },

  sendTestNotification: async () => {
    return await notificationService.sendNotification({
      title: 'WorkingEnglish · Thông báo thử nghiệm 🎉',
      body: 'Hệ thống nhắc nhở học tập và ôn từ vựng Spaced Repetition đang hoạt động tốt trên máy tính của bạn!'
    });
  }
};
