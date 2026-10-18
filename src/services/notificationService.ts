export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: ((notifications: AppNotification[]) => void)[] = [];

  public async requestBrowserPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public notify(title: string, message: string, type: AppNotification['type'] = 'info'): void {
    const item: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.notifications = [item, ...this.notifications].slice(0, 20);
    this.notifyListeners();

    // Trigger browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        // Ignore fallback
      }
    }
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  public subscribe(listener: (notifications: AppNotification[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.notifications));
  }
}

export const notificationService = new NotificationService();
