'use client';

import { useState } from 'react';
import { Bell, Check, Sparkles, X } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (typeof window !== 'undefined' && (window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
            await OneSignal.Notifications.requestPermission();
          } else if (OneSignal.Slidedown) {
            await OneSignal.Slidedown.promptPush();
          }
        } catch (e) {
          console.log('OneSignal prompt error:', e);
        }
      });
    }
    setIsSubscribed(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  return (
    <>
      {/* Floating Bell Button (Fixed Bottom-Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group"
        aria-label="Subscribe to Breaking News"
      >
        <Bell className="w-5 h-5 animate-bounce group-hover:animate-none" />
        <span className="text-sm hidden sm:inline">Get Breaking News</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </button>

      {/* Subscription Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground">Breaking News Alerts</h3>
                <p className="text-xs text-muted-foreground">Never miss viral trends & instant news updates</p>
              </div>
            </div>

            {isSubscribed ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-foreground">Notifications Enabled!</h4>
                <p className="text-xs text-muted-foreground mt-1">You will get real-time alerts when top stories break.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get instant push notifications sent directly to your phone or desktop whenever major news breaks across Sports, Entertainment, Tech & Politics.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubscribe}
                    className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-xl transition-colors shadow-md"
                  >
                    Enable Notifications 🔔
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-4 bg-muted hover:bg-muted/80 text-muted-foreground text-sm font-medium rounded-xl transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
