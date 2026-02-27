import './globals.css'
import { AuthProvider } from '@/lib/use-auth.tsx'

export const metadata = {
  title: 'Trip Splitter - 旅游分账',
  description: '支持 Family 维度聚合结算的旅游分账工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
