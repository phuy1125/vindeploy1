// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: 'Viet Tour',
  description: 'Vietnam Tour Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
		<AuthProvider>
        {children}
		</AuthProvider>
      </body>
    </html>
  )
}