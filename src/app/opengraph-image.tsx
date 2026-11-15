import { ImageResponse } from 'next/og';

export const alt = 'Verve CRM — Pilotage Commercial & Mandats B2B';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0B1017',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.22), transparent 45%), radial-gradient(circle at 15% 85%, rgba(4, 120, 87, 0.18), transparent 45%)',
          padding: '64px 72px',
          color: '#F1F5F9',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '26px',
                fontWeight: 800,
              }}
            >
              V
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Verve CRM
              </span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                Atelier Nova — Espace Associés
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 18px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#34D399',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            Next.js 15 • Supabase RLS • Noble Emerald
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '920px' }}>
          <div
            style={{
              fontSize: '60px',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            Pilotage commercial, mandats B2B &amp; trésorerie prévisionnelle.
          </div>
          <div
            style={{
              fontSize: '24px',
              lineHeight: 1.45,
              color: '#94A3B8',
              maxWidth: '820px',
            }}
          >
            Conçu pour les cabinets de conseil et agences digitales : pipeline Kanban en 5 étapes, lettres de mission PDF et synchronisation cloud sécurisée.
          </div>
        </div>

        {/* Bottom KPI Strip */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 28px',
              borderRadius: '16px',
              backgroundColor: '#121A24',
              border: '1px solid #222F3E',
              minWidth: '240px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase' }}>
              Portefeuille pondéré
            </span>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#34D399', marginTop: '4px' }}>
              118 925 € HT
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 28px',
              borderRadius: '16px',
              backgroundColor: '#121A24',
              border: '1px solid #222F3E',
              minWidth: '240px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase' }}>
              Cycle moyen de closing
            </span>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#F1F5F9', marginTop: '4px' }}>
              18 jours
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 28px',
              borderRadius: '16px',
              backgroundColor: '#121A24',
              border: '1px solid #222F3E',
              minWidth: '260px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase' }}>
              Documents &amp; Rapports
            </span>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#F1F5F9', marginTop: '4px' }}>
              Exports PDF &amp; CSV
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
