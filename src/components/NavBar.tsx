'use client'
import { Link } from '@tanstack/react-router'
import { UserButton, useUser } from '@clerk/tanstack-react-start'
import { Mail, PenLine, Inbox } from 'lucide-react'

export function NavBar() {
  const { isLoaded, isSignedIn, user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-600">
          <Mail size={20} />
          SecureMsg
        </Link>

        {isLoaded && isSignedIn ? (
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Inbox size={16} />
              Inbox
            </Link>
            <Link
              to="/compose"
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PenLine size={16} />
              Compose
            </Link>
            <span className="text-xs text-gray-400 max-w-[140px] truncate hidden sm:block">
              {email}
            </span>
            <UserButton />
          </nav>
        ) : isLoaded ? (
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign up
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
