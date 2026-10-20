import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { NavBar } from '@/components/NavBar'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'SecureMsg — Encrypted Message Manager' },
      {
        name: 'description',
        content: 'End-to-end encrypted private messaging with secure authentication.',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <ClerkProvider>
          <NavBar />
          {children}
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
