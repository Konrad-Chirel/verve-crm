import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement en cours">
      <div className="space-y-2">
        <div className="h-3.5 w-36 rounded bg-[#E4E7EC]" />
        <div className="h-8 w-64 rounded-lg bg-[#E4E7EC]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-3 shadow-2xs"
          >
            <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
            <div className="h-7 w-32 rounded bg-[#E4E7EC]" />
            <div className="h-2.5 w-20 rounded bg-[#F3F4F6]" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="h-4 w-48 rounded bg-[#E4E7EC]" />
        <div className="h-56 w-full rounded-lg bg-[#F9FAFB]" />
      </div>
    </div>
  );
}
