'use client';

export default function TripsPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>My Trips</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>No trips yet - Start planning your next adventure!</p>
      <a href="/trips/new" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'inline-block'
      }}>
        Create Your First Trip
      </a>
    </div>
  )
}
