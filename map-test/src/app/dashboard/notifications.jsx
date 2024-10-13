// Notifications.js
'use client'

import {ScrollArea} from '@/components/ui/scroll-area'
import {Badge} from '@/components/ui/badge'

export default function Notifications({notifications}) {
  return (
    <div>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications.</p>
      ) : (
        notifications.map((notification, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <Badge variant="warning">Notification</Badge>
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">
              <strong>To:</strong> {notification.recipient}
            </p>
            <p className="text-sm">{notification.message}</p>
          </div>
        ))
      )}
    </div>
  )
}
