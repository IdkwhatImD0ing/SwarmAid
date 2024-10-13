'use client'

import {ScrollArea} from '@/components/ui/scroll-area'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'

export default function Notifications({notifications}) {
  return (
    <>
      {notifications.length === 0 && (
        <div className="text-center text-sm text-gray-500">
          No notifications yet.
        </div>
      )}
      {notifications.map((notification, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <Badge
              variant="warning"
              className="text-xs uppercase bg-yellow-100 text-yellow-800"
            >
              Notification
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(notification.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">
            <strong>To:</strong> {notification.recipient}
          </p>
          <p className="text-sm text-gray-600">{notification.message}</p>
          {/* Optional: Divider between notifications */}
          {index < notifications.length - 1 && (
            <hr className="mt-2 border-gray-200" />
          )}
        </div>
      ))}
    </>
  )
}
