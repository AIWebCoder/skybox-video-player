import type { Metadata } from 'next/types'
import './globals.css'
import React from 'react'

export const metadata: Metadata = {
  title: 'Skybox VR Player',
  description: 'VR Player with A-Frame',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return React.createElement(
    'html',
    { lang: 'fr' },
    React.createElement('body', null, children)
  )
}

