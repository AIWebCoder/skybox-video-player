import Link from 'next/link';

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '2rem',
      }}
    >
      <h1>Skybox VR Player</h1>
      <Link
        href="/vr"
        style={{
          padding: '1rem 2rem',
          background: '#4CC3D9',
          color: '#000',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        Entrer en VR
      </Link>
    </div>
  );
}

