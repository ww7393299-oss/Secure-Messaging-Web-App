import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { sendMessageFn } from '@/server/messages.functions'
import { useState } from 'react'
import { AlertCircle, Send, ArrowLeft } from 'lucide-react'
import { z } from 'zod'

const searchSchema = z.object({
  to: z.string().optional(),
  subject: z.string().optional(),
})

export const Route = createFileRoute('/compose')({
  validateSearch: (search) => searchSchema.parse(search),
  component: Compose,
})

const MAX_BODY = 10_000
const MAX_SUBJECT = 200

function Compose() {
  const navigate = useNavigate()
  const { to, subject } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [bodyLen, setBodyLen] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const toEmail = (fd.get('toEmail') as string).trim()
    const subjectVal = (fd.get('subject') as string).trim()
    const body = (fd.get('body') as string).trim()

    // Client-side validation (mirrors server Zod schema)
    if (!toEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Recipient must be a valid email address.')
      return
    }
    if (!subjectVal) {
      setError('Subject is required.')
      return
    }
    if (subjectVal.length > MAX_SUBJECT) {
      setError(`Subject must be ${MAX_SUBJECT} characters or fewer.`)
      return
    }
    if (!body) {
      setError('Message body is required.')
      return
    }
    if (body.length > MAX_BODY) {
      setError(`Message must be ${MAX_BODY.toLocaleString()} characters or fewer.`)
      return
    }

    setSending(true)
    try {
      await sendMessageFn({ data: { toEmail, subject: subjectVal, body } })
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Back to inbox"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Message</h1>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="divide-y divide-gray-100">
          {/* To */}
          <div className="flex items-center px-4 py-3 gap-3">
            <span className="text-sm font-medium text-gray-500 w-16 shrink-0">To</span>
            <input
              name="toEmail"
              type="email"
              required
              defaultValue={to ?? ''}
              placeholder="recipient@example.com"
              className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400"
              autoComplete="email"
              autoFocus={!to}
            />
          </div>

          {/* Subject */}
          <div className="flex items-center px-4 py-3 gap-3">
            <span className="text-sm font-medium text-gray-500 w-16 shrink-0">Subject</span>
            <input
              name="subject"
              type="text"
              required
              maxLength={MAX_SUBJECT}
              defaultValue={subject ?? ''}
              placeholder="What is this about?"
              className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <textarea
              name="body"
              required
              maxLength={MAX_BODY}
              rows={12}
              placeholder="Write your message here…"
              className="w-full text-sm outline-none text-gray-900 placeholder:text-gray-400 resize-none"
              onChange={(e) => setBodyLen(e.target.value.length)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400">
            {bodyLen.toLocaleString()} / {MAX_BODY.toLocaleString()} characters
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} />
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        Messages are encrypted with AES-256-GCM before storage.
      </p>
    </div>
  )
}
