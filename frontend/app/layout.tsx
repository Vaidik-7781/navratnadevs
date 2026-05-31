import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NavratnaDevs — Your idea. 9 agents. One product.',
  description: '9 specialist AI agents who debate, vote, and build your app idea while you play Tech Lead.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
                <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
