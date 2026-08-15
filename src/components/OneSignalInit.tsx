'use client';

import { useEffect } from 'react';

export function OneSignalInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        await OneSignal.init({
          appId: "fd795284-7bb7-48af-b19e-284270c5168e",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
            position: 'bottom-right',
            displayPredicate: function() {
              return true;
            },
            text: {
              'tip.state.unsubscribed': 'Subscribe to Breaking News Alerts',
              'tip.state.subscribed': "You're subscribed to Breaking News",
              'tip.state.blocked': "You've blocked notifications",
              'message.action.subscribed': "Thanks for subscribing!",
              'message.action.resubscribed': "You're subscribed to notifications",
              'message.action.unsubscribed': "You won't receive notifications again",
              'dialog.main.title': 'Manage News Notifications',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            }
          },
        });
      } catch (err) {
        console.error('OneSignal Client Init Error:', err);
      }
    });
  }, []);

  return null;
}
