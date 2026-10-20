import { createServerFn, createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { z } from 'zod'
import {
  getInbox,
  getSent,
  getMessageDetail,
  saveMessage,
  markRead,
  removeFromIndex,
} from './messages.server'

// ---------------------------------------------------------------------------
// Auth middleware — injects the current user into server function context.
// Redirects to /login if not authenticated.
// ---------------------------------------------------------------------------
const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) throw redirect({ to: '/login' })

  const clerkUser = await clerkClient().users.getUser(userId)
  const email = clerkUser.primaryEmailAddress?.emailAddress
  if (!email) throw new Error('Your Clerk account needs a verified email address.')

  return next({ context: { user: { id: userId, email } } })
})

export const getCurrentUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context as { user: { id: string; email: string } }
    return user
  })

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const getInboxMessages = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context as { user: { id: string; email: string } }
    return getInbox(user.email)
  })

export const getSentMessages = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context as { user: { id: string; email: string } }
    return getSent(user.email)
  })

export const getMessageById = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { user } = context as { user: { id: string; email: string } }
    const message = await getMessageDetail(data.id, user.email)
    if (!message) throw new Error('Message not found or access denied')
    return message
  })

export const sendMessageFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      toEmail: z
        .string()
        .email('Recipient must be a valid email address')
        .max(254),
      subject: z
        .string()
        .min(1, 'Subject is required')
        .max(200, 'Subject must be 200 characters or fewer'),
      body: z
        .string()
        .min(1, 'Message body is required')
        .max(10_000, 'Message must be 10,000 characters or fewer'),
    }),
  )
  .handler(async ({ data, context }) => {
    const { user } = context as { user: { id: string; email: string } }
    const id = await saveMessage({
      fromEmail: user.email,
      fromId: user.id,
      toEmail: data.toEmail,
      subject: data.subject,
      body: data.body,
    })
    return { id }
  })

export const markMessageRead = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { user } = context as { user: { id: string; email: string } }
    await markRead(data.id, user.email)
    return { ok: true }
  })

export const deleteMessageFromFolder = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().uuid(),
      folder: z.enum(['inbox', 'sent']),
    }),
  )
  .handler(async ({ data, context }) => {
    const { user } = context as { user: { id: string; email: string } }
    await removeFromIndex(data.id, data.folder, user.email)
    return { ok: true }
  })
