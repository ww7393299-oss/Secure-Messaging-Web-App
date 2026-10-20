import { createFileRoute } from '@tanstack/react-router'
import { Shield, Lock, Key, ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
        <Lock size={14} />
        AES-256-GCM encrypted messaging
      </div>

      <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
        Private messages,
        <br />
        <span className="text-blue-600">truly secure.</span>
      </h1>

      <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
        SecureMsg encrypts every message with AES-256-GCM before storage, protects access with
        authenticated sessions, and guards against XSS, CSRF, and injection attacks.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
        <Link
          to="/signup"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started Free <ArrowRight size={18} />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Sign In
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-left">
        <SecurityCard
          icon={<Lock size={24} className="text-blue-600" />}
          title="Encrypted at Rest"
          body="Messages are encrypted with AES-256-GCM before being written to storage. Each message uses a unique IV and includes a GCM auth tag to detect tampering."
        />
        <SecurityCard
          icon={<Shield size={24} className="text-green-600" />}
          title="Authenticated Access"
          body="Every request is verified with Clerk sessions. Unauthenticated and unauthorized requests are rejected server-side before any data is accessed."
        />
        <SecurityCard
          icon={<Key size={24} className="text-purple-600" />}
          title="Defense in Depth"
          body="Security headers (CSP, HSTS, X-Frame-Options), Zod input validation, SameSite cookies for CSRF prevention, and no SQL — no injection surface."
        />
      </div>
    </main>
  )
}

function SecurityCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
    </div>
  )
}
