import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { getCurrentUser, getMessageById, markMessageRead, deleteMessageFromFolder } from '@/server/messages.functions'
import { useState } from 'react'
import { ArrowLeft, Trash2, Reply, Lock } from 'lucide-react'

export const Route = createFileRoute('/message/$messageId')({
  loader: async ({ params }) => {
    const [message, user] = await Promise.all([
      getMessageById({ data: { id: params.messageId } }),
      getCurrentUser(),
    ])
    // Mark as read if the current user is the recipient
    if (message && user && message.toEmail === user.email.toLowerCase() && !message.read) {
      await markMessageRead({ data: { id: params.messageId } })
    }
    return { message, userEmail: user.email }
  },
  component: MessageView,
})

function MessageView() {
  const { message, userEmail } = Route.useLoaderData()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  if (!message) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        Message not found or you do not have access.
      </div>
    )
  }

  const folder: 'inbox' | 'sent' =
    message.toEmail === userEmail.toLowerCase() ? 'inbox' : 'sent'

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteMessageFromFolder({ data: { id: message!.id, folder } })
      navigate({ to: '/dashboard' })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to inbox
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/compose"
            search={{ to: message.fromEmail, subject: `Re: ${message.subject}` }}
            className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Reply size={15} />
            Reply
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={15} />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Message card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Metadata */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">{message.subject}</h1>
          <dl className="space-y-1 text-sm">
            <MetaRow label="From" value={message.fromEmail} />
            <MetaRow label="To" value={message.toEmail} />
            <MetaRow
              label="Date"
              value={new Date(message.createdAt).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
          </dl>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
            {message.body}
          </pre>
        </div>

        {/* Encryption badge */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <Lock size={11} />
            Decrypted from AES-256-GCM
          </span>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-12 text-gray-400 shrink-0">{label}</dt>
      <dd className="text-gray-700">{value}</dd>
    </div>
  )
}
