import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skybox VR Player',
  description: 'VR Player with A-Frame',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

