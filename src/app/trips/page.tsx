export default function TripsPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>My Trips</h1>
      <p style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        No trips yet - Start planning your next adventure!
      </p>
      <a
        href="/trips/new"
        style={{
          background: 'white',
          color: '#667eea',
          padding: '14px 28px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-block'
        }}
      >
        Create Your First Trip
      </a>
    </div>
  );
}
