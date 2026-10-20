import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getInboxMessages, getSentMessages, deleteMessageFromFolder } from '@/server/messages.functions'
import { useState } from 'react'
import { Inbox, Send, Trash2, RefreshCw, PenLine } from 'lucide-react'
import type { MessageSummary } from '@/server/messages.server'

type Folder = 'inbox' | 'sent'

export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    const [inbox, sent] = await Promise.all([getInboxMessages(), getSentMessages()])
    return { inbox, sent }
  },
  component: Dashboard,
})

function Dashboard() {
  const { inbox, sent } = Route.useLoaderData()
  const [folder, setFolder] = useState<Folder>('inbox')
  const [localInbox, setLocalInbox] = useState<MessageSummary[]>(inbox)
  const [localSent, setLocalSent] = useState<MessageSummary[]>(sent)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const messages = folder === 'inbox' ? localInbox : localSent
  const unreadCount = localInbox.filter((m) => !m.read).length

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await deleteMessageFromFolder({ data: { id, folder } })
      if (folder === 'inbox') {
        setLocalInbox((prev) => prev.filter((m) => m.id !== id))
      } else {
        setLocalSent((prev) => prev.filter((m) => m.id !== id))
      }
    } catch {
      /* silently ignore — list stays unchanged */
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.invalidate()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            to="/compose"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <PenLine size={16} />
            Compose
          </Link>
        </div>
      </div>

      {/* Folder tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setFolder('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            folder === 'inbox'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox size={16} />
          Inbox
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFolder('sent')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            folder === 'sent'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send size={16} />
          Sent
        </button>
      </div>

      {/* Message list */}
      {messages.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-1">No messages</p>
          <p className="text-sm">
            {folder === 'inbox'
              ? 'Your inbox is empty.'
              : 'You have not sent any messages yet.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {messages.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              folder={folder}
              onDelete={() => handleDelete(msg.id)}
              isDeleting={deleting === msg.id}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function MessageRow({
  msg,
  folder,
  onDelete,
  isDeleting,
}: {
  msg: MessageSummary
  folder: Folder
  onDelete: () => void
  isDeleting: boolean
}) {
  const isUnread = !msg.read && folder === 'inbox'

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
      {/* Unread indicator */}
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${isUnread ? 'bg-blue-600' : 'bg-transparent'}`}
      />

      {/* Message link */}
      <Link
        to="/message/$messageId"
        params={{ messageId: msg.id }}
        className="flex-1 min-w-0"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
          >
            {folder === 'inbox' ? `From: ${msg.fromEmail}` : `To: ${msg.toEmail}`}
          </span>
          <span className="text-xs text-gray-400 shrink-0">
            {formatDate(msg.createdAt)}
          </span>
        </div>
        <div
          className={`text-sm truncate mt-0.5 ${isUnread ? 'text-gray-800' : 'text-gray-500'}`}
        >
          {msg.subject}
        </div>
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          onDelete()
        }}
        disabled={isDeleting}
        className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
