import { createFileRoute, redirect } from '@tanstack/react-router'

// The old FAQ page has been replaced — redirect to the dashboard.
export const Route = createFileRoute('/faq')({
  loader: async () => {
    throw redirect({ to: '/dashboard' })
  },
  component: () => null,
})
