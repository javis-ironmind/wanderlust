export const metadata = {
  title: 'Wanderlust',
  description: 'Travel Planner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
