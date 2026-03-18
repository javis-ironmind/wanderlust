export default function NewTripPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <a href="/trips" style={{ display: 'inline-block', marginBottom: '1rem', color: 'white', textDecoration: 'none' }}>
        ← Back
      </a>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'white' }}>Create New Trip</h1>
      
      <form action="/trips" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>
            Trip Name
          </label>
          <input
            name="name"
            type="text"
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            placeholder="e.g., Japan Adventure 2026"
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>
        </div>
        
        <button
          type="submit"
          style={{
            background: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Create Trip
        </button>
      </form>
    </div>
  );
}
