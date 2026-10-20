import { get, put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import { encrypt, decrypt } from './crypto.server'

export interface StoredMessage {
  id: string
  fromEmail: string
  fromId: string
  toEmail: string
  subject: string
  encryptedBody: string
  createdAt: string
  read: boolean
}

export interface MessageSummary {
  id: string
  fromEmail: string
  toEmail: string
  subject: string
  createdAt: string
  read: boolean
}

export interface MessageDetail extends MessageSummary {
  body: string
}

/** Converts an email into a safe blob key segment. */
function emailSlug(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

const BLOB_ACCESS = 'private' as const

function messagePath(id: string): string {
  return `messages/${id}.json`
}

function indexPath(key: string): string {
  return `indexes/${key}.json`
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, {
    access: BLOB_ACCESS,
    // Message indexes change often; bypass cache so reads see the latest value.
    useCache: false,
  })

  if (!result || result.statusCode !== 200 || !result.stream) return null
  const text = await new Response(result.stream).text()
  return JSON.parse(text) as T
}

async function writeJson(pathname: string, value: unknown): Promise<void> {
  await put(pathname, JSON.stringify(value), {
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function saveMessage(params: {
  fromEmail: string
  fromId: string
  toEmail: string
  subject: string
  body: string
}): Promise<string> {
  const id = randomUUID()
  const msg: StoredMessage = {
    id,
    fromEmail: params.fromEmail.toLowerCase(),
    fromId: params.fromId,
    toEmail: params.toEmail.toLowerCase(),
    subject: params.subject,
    encryptedBody: encrypt(params.body),
    createdAt: new Date().toISOString(),
    read: false,
  }

  await writeJson(messagePath(id), msg)

  // Update sender's sent index
  const sentKey = `sent:${emailSlug(params.fromEmail)}`
  const sentIds = (await readJson<string[]>(indexPath(sentKey))) ?? []
  sentIds.unshift(id)
  await writeJson(indexPath(sentKey), sentIds)

  // Update recipient's inbox index
  const inboxKey = `inbox:${emailSlug(params.toEmail)}`
  const inboxIds = (await readJson<string[]>(indexPath(inboxKey))) ?? []
  inboxIds.unshift(id)
  await writeJson(indexPath(inboxKey), inboxIds)

  return id
}

async function fetchRawMessage(id: string): Promise<StoredMessage | null> {
  return readJson<StoredMessage>(messagePath(id))
}

export async function getMessageDetail(
  id: string,
  requestingEmail: string,
): Promise<MessageDetail | null> {
  const msg = await fetchRawMessage(id)
  if (!msg) return null
  const email = requestingEmail.toLowerCase()
  if (msg.fromEmail !== email && msg.toEmail !== email) return null
  return {
    id: msg.id,
    fromEmail: msg.fromEmail,
    toEmail: msg.toEmail,
    subject: msg.subject,
    body: decrypt(msg.encryptedBody),
    createdAt: msg.createdAt,
    read: msg.read,
  }
}

async function listMessages(
  folder: 'inbox' | 'sent',
  email: string,
): Promise<MessageSummary[]> {
  const key = `${folder}:${emailSlug(email)}`
  const ids = (await readJson<string[]>(indexPath(key))) ?? []

  const summaries = await Promise.all(
    ids.map(async (id) => {
      const msg = await readJson<StoredMessage>(messagePath(id))
      if (!msg) return null
      return {
        id: msg.id,
        fromEmail: msg.fromEmail,
        toEmail: msg.toEmail,
        subject: msg.subject,
        createdAt: msg.createdAt,
        read: msg.read,
      } satisfies MessageSummary
    }),
  )

  return summaries.filter((m): m is MessageSummary => m !== null)
}

export function getInbox(email: string) {
  return listMessages('inbox', email)
}

export function getSent(email: string) {
  return listMessages('sent', email)
}

export async function markRead(id: string, userEmail: string): Promise<void> {
  const msg = await readJson<StoredMessage>(messagePath(id))
  if (!msg || msg.toEmail !== userEmail.toLowerCase()) return
  if (msg.read) return
  msg.read = true
  await writeJson(messagePath(id), msg)
}

export async function removeFromIndex(
  id: string,
  folder: 'inbox' | 'sent',
  userEmail: string,
): Promise<void> {
  const key = `${folder}:${emailSlug(userEmail)}`
  const ids = (await readJson<string[]>(indexPath(key))) ?? []
  await writeJson(indexPath(key), ids.filter((i) => i !== id))
}
