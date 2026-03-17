export default function TripsPage() {
  return (
    <html>
      <head>
        <title>My Trips</title>
      </head>
      <body style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>My Trips</h1>
          <p style={{ color: 'white', marginBottom: '2rem' }}>No trips yet</p>
          <a href="/trips/new" style={{ background: 'white', color: '#667eea', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
            Create Your First Trip
          </a>
        </div>
      </body>
    </html>
  )
}
