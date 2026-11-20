import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#047857',
          borderRadius: '40px',
          color: '#FFFFFF',
          fontSize: 108,
          fontWeight: 800,
          letterSpacing: '-0.04em',
        }}
      >
        V
      </div>
    ),
    {
      ...size,
    }
  );
}
