import React, { useState } from 'react';
import { PageId } from '../types';
import { REGIONS } from '../data/regions';
import { STORIES } from '../data/stories';

interface MapPageProps {
  onNavigate: (page: PageId, storyId?: string) => void;
  initialRegion?: string;
  onOpenGlossary: () => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  onNavigate,
  initialRegion = 'sulawesi',
  onOpenGlossary
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialRegion || 'sulawesi');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const regionData = REGIONS[selectedKey] || REGIONS['sulawesi'];

  // Map markers coordinates on SVG viewBox [0 0 1000 480]
  const islandPins = [
    { key: 'sumatera', name: 'Sumatera', code: 'SMT-ID', x: 220, y: 220, count: 18, category: 'kerajaan' },
    { key: 'kalimantan', name: 'Kalimantan', code: 'KLM-ID', x: 440, y: 210, count: 12, category: 'pegunungan' },
    { key: 'jawa', name: 'Jawa & Madura', code: 'JWA-ID', x: 380, y: 350, count: 24, category: 'kerajaan' },
    { key: 'sulawesi', name: 'Sulawesi', code: 'SLW-ID', x: 610, y: 230, count: 15, category: 'bahari' },
    { key: 'balinusra', name: 'Bali & Nusra', code: 'BLN-ID', x: 530, y: 380, count: 14, category: 'bahari' },
    { key: 'maluku', name: 'Maluku', code: 'MLK-ID', x: 740, y: 240, count: 8, category: 'bahari' },
    { key: 'papua', name: 'Papua', code: 'PPU-ID', x: 880, y: 260, count: 8, category: 'pegunungan' },
  ];

  const regionStories = STORIES.filter(s => {
    if (selectedKey === 'sumatera') return s.regionKey === 'sumatera';
    if (selectedKey === 'jawa') return s.regionKey === 'jawa';
    if (selectedKey === 'kalimantan') return s.regionKey === 'kalimantan';
    if (selectedKey === 'sulawesi') return s.regionKey === 'sulawesi';
    if (selectedKey === 'balinusra') return s.regionKey === 'balinusra';
    if (selectedKey === 'maluku') return s.regionKey === 'maluku';
    if (selectedKey === 'papua') return s.regionKey === 'papua';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FCFAF5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#667483] mb-4">
          <button
            onClick={() => onNavigate('beranda')}
            className="hover:text-[#0e2444] transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0e2444] font-semibold">Peta Nusantara</span>
        </nav>

        {/* Title Header */}
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a] block mb-1">
            Peta Etnofolklor Nusantara
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e2444] tracking-tight leading-tight mb-3">
            Jelajahi Sebaran Cerita Rakyat Berdasarkan Bentang Kepulauan
          </h1>
          <p className="text-[#667483] text-sm sm:text-base leading-relaxed">
            Klik pada pin gugus kepulauan untuk melihat naskah terverifikasi, konteks adat wilayah, dan tradisi lisan yang hidup di setiap bentang alam Nusantara.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { key: 'all', label: 'Semua Tradisi' },
            { key: 'bahari', label: '⛵ Tradisi Bahari & Maritim' },
            { key: 'pegunungan', label: '⛰️ Mitos Pegunungan & Rimba' },
            { key: 'kerajaan', label: '👑 Kisah Kerajaan Kuno' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryFilter(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCategoryFilter === cat.key
                  ? 'bg-[#0e2444] text-white shadow-xs'
                  : 'bg-[#F3EFE7] text-[#344454] border border-[#E7E0D4] hover:bg-[#E7E0D4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* INTERACTIVE SVG ARCHIPELAGO MAP CONTAINER */}
        <div className="relative bg-[#F3EFE7] rounded-3xl border border-[#E7E0D4] overflow-hidden p-4 sm:p-6 mb-10 shadow-xs">
          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-1.5 bg-[#FCFAF5]/90 backdrop-blur-xs p-1.5 rounded-xl border border-[#E7E0D4] shadow-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 1.75))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0e2444] hover:bg-[#E7E0D4] transition-colors cursor-pointer"
              title="Perbesar"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.85))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0e2444] hover:bg-[#E7E0D4] transition-colors cursor-pointer"
              title="Perkecil"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0e2444] hover:bg-[#E7E0D4] transition-colors cursor-pointer"
              title="Reset Tampilan"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            </button>
          </div>

          {/* Compass Rose & Coordinate Metadata */}
          <div className="absolute bottom-6 left-6 z-10 hidden sm:flex items-center gap-3 text-[11px] text-[#667483] bg-[#FCFAF5]/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E7E0D4]">
            <span className="material-symbols-outlined text-[#9d422a] text-[16px]">explore</span>
            <span>6°LU - 11°LS • 95°BT - 141°BT • Poros Maritim Khatulistiwa</span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto overflow-y-hidden py-4">
            <div
              className="min-w-[720px] transition-transform duration-300 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 1000 460"
                className="w-full h-auto select-none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))' }}
              >
                {/* Sea Grids & Equator */}
                <line x1="20" y1="230" x2="980" y2="230" stroke="#0e2444" strokeOpacity="0.1" strokeDasharray="6 6" strokeWidth="1" />
                <text x="30" y="222" fill="#667483" fontSize="10" fontWeight="bold">0° KHATULISTIWA</text>

                {/* Maritime trade routes dotted paths */}
                <path d="M 210 210 Q 320 270 420 260 T 600 240 T 730 250 T 870 270" fill="none" stroke="#9d422a" strokeOpacity="0.25" strokeDasharray="4 4" strokeWidth="1.5" />
                <path d="M 230 250 Q 340 330 380 340 T 520 370 T 740 300" fill="none" stroke="#0e2444" strokeOpacity="0.2" strokeDasharray="3 3" strokeWidth="1.2" />

                {/* SUMATERA */}
                <g
                  onClick={() => setSelectedKey('sumatera')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <path
                    d="M 120 120 C 145 105, 175 145, 215 200 C 245 240, 270 295, 290 330 C 275 340, 255 330, 230 290 C 190 230, 140 180, 115 130 Z"
                    fill={selectedKey === 'sumatera' ? '#263a5b' : '#E7E0D4'}
                    stroke={selectedKey === 'sumatera' ? '#0e2444' : '#d2c7b5'}
                    strokeWidth="2"
                  />
                  {/* Nias & Mentawai */}
                  <ellipse cx="140" cy="230" rx="10" ry="18" fill={selectedKey === 'sumatera' ? '#263a5b' : '#E7E0D4'} transform="rotate(-30 140 230)" />
                  <ellipse cx="185" cy="290" rx="8" ry="16" fill={selectedKey === 'sumatera' ? '#263a5b' : '#E7E0D4'} transform="rotate(-30 185 290)" />
                </g>

                {/* JAWA & MADURA */}
                <g
                  onClick={() => setSelectedKey('jawa')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <path
                    d="M 295 345 C 330 340, 380 340, 440 350 C 490 358, 510 365, 515 370 C 470 378, 380 370, 305 365 C 290 360, 285 350, 295 345 Z"
                    fill={selectedKey === 'jawa' ? '#263a5b' : '#E7E0D4'}
                    stroke={selectedKey === 'jawa' ? '#0e2444' : '#d2c7b5'}
                    strokeWidth="2"
                  />
                  {/* Madura */}
                  <ellipse cx="485" cy="345" rx="20" ry="7" fill={selectedKey === 'jawa' ? '#263a5b' : '#E7E0D4'} />
                </g>

                {/* KALIMANTAN */}
                <g
                  onClick={() => setSelectedKey('kalimantan')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <path
                    d="M 370 170 C 410 140, 470 145, 500 175 C 525 200, 520 255, 485 285 C 445 295, 400 280, 375 250 C 355 220, 350 190, 370 170 Z"
                    fill={selectedKey === 'kalimantan' ? '#263a5b' : '#E7E0D4'}
                    stroke={selectedKey === 'kalimantan' ? '#0e2444' : '#d2c7b5'}
                    strokeWidth="2"
                  />
                </g>

                {/* SULAWESI */}
                <g
                  onClick={() => setSelectedKey('sulawesi')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <path
                    d="M 575 165 C 610 160, 640 175, 635 190 C 605 195, 595 210, 600 230 C 625 235, 650 245, 640 260 C 615 255, 595 250, 585 270 C 580 300, 590 320, 580 330 C 565 330, 560 280, 570 250 C 555 240, 550 215, 565 190 Z"
                    fill={selectedKey === 'sulawesi' ? '#263a5b' : '#E7E0D4'}
                    stroke={selectedKey === 'sulawesi' ? '#0e2444' : '#d2c7b5'}
                    strokeWidth="2"
                  />
                </g>

                {/* BALI & NUSA TENGGARA */}
                <g
                  onClick={() => setSelectedKey('balinusra')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <ellipse cx="530" cy="376" rx="9" ry="6" fill={selectedKey === 'balinusra' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                  <ellipse cx="555" cy="378" rx="14" ry="7" fill={selectedKey === 'balinusra' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                  <ellipse cx="595" cy="379" rx="22" ry="7" fill={selectedKey === 'balinusra' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                  <ellipse cx="645" cy="378" rx="24" ry="8" fill={selectedKey === 'balinusra' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                  <ellipse cx="685" cy="388" rx="22" ry="9" fill={selectedKey === 'balinusra' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                </g>

                {/* MALUKU */}
                <g
                  onClick={() => setSelectedKey('maluku')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <ellipse cx="715" cy="200" rx="14" ry="24" fill={selectedKey === 'maluku' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                  <ellipse cx="740" cy="245" rx="25" ry="10" fill={selectedKey === 'maluku' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                  <ellipse cx="755" cy="310" rx="12" ry="18" fill={selectedKey === 'maluku' ? '#263a5b' : '#E7E0D4'} stroke="#d2c7b5" />
                </g>

                {/* PAPUA */}
                <g
                  onClick={() => setSelectedKey('papua')}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                >
                  <path
                    d="M 800 230 C 820 200, 860 215, 900 230 C 940 245, 960 270, 955 330 C 910 335, 875 320, 850 280 C 835 285, 810 265, 800 230 Z"
                    fill={selectedKey === 'papua' ? '#263a5b' : '#E7E0D4'}
                    stroke={selectedKey === 'papua' ? '#0e2444' : '#d2c7b5'}
                    strokeWidth="2"
                  />
                </g>

                {/* PINS & LABELS */}
                {islandPins.map((pin) => {
                  const isSelected = selectedKey === pin.key;
                  const matchesCategory =
                    activeCategoryFilter === 'all' || pin.category === activeCategoryFilter;

                  return (
                    <g
                      key={pin.key}
                      onClick={() => setSelectedKey(pin.key)}
                      className={`cursor-pointer transition-all ${matchesCategory ? 'opacity-100' : 'opacity-35'}`}
                    >
                      {/* Pulse circle for selected pin */}
                      {isSelected && (
                        <circle
                          cx={pin.x}
                          cy={pin.y}
                          r="22"
                          fill="#9d422a"
                          fillOpacity="0.2"
                          className="animate-ping"
                        />
                      )}

                      {/* Pin Outer */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r={isSelected ? 14 : 10}
                        fill={isSelected ? '#9d422a' : '#0e2444'}
                        stroke="#FCFAF5"
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />

                      {/* Pin Inner Dot */}
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r="4"
                        fill="#ffffff"
                      />

                      {/* Label Card */}
                      <g transform={`translate(${pin.x}, ${pin.y + (isSelected ? 22 : 18)})`}>
                        <rect
                          x="-45"
                          y="-10"
                          width="90"
                          height="20"
                          rx="6"
                          fill={isSelected ? '#0e2444' : '#FCFAF5'}
                          stroke={isSelected ? '#9d422a' : '#E7E0D4'}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill={isSelected ? '#ffffff' : '#0e2444'}
                        >
                          {pin.name} ({pin.count})
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#F3EFE7] p-5 rounded-2xl border border-[#E7E0D4]">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2444] mb-1">7</div>
            <div className="text-xs text-[#667483] font-medium">Gugus Kepulauan Utama</div>
          </div>
          <div className="bg-[#F3EFE7] p-5 rounded-2xl border border-[#E7E0D4]">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2444] mb-1">99</div>
            <div className="text-xs text-[#667483] font-medium">Naskah Terdigitalisasi</div>
          </div>
          <div className="bg-[#F3EFE7] p-5 rounded-2xl border border-[#E7E0D4]">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#9d422a] mb-1">100%</div>
            <div className="text-xs text-[#667483] font-medium">Verifikasi Etnofolklor</div>
          </div>
          <div className="bg-[#F3EFE7] p-5 rounded-2xl border border-[#E7E0D4]">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2444] mb-1">4.8 / 5</div>
            <div className="text-xs text-[#667483] font-medium">Apresiasi Pembaca Pelajar</div>
          </div>
        </div>

        {/* REGION DETAIL INSPECTOR */}
        <div className="bg-[#FCFAF5] rounded-3xl border border-[#E7E0D4] p-6 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E7E0D4] gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white bg-[#0e2444] px-2.5 py-0.5 rounded">
                  {regionData.code}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9d422a]">
                  {regionData.badge}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0e2444]">
                {regionData.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#667483] mt-1">
                Wilayah Administrasi: {regionData.provinces}
              </p>
            </div>

            <button
              onClick={() => onNavigate('katalog-cerita')}
              className="bg-[#9d422a] hover:bg-[#0e2444] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer self-start md:self-auto inline-flex items-center gap-2"
            >
              <span>Lihat Semua Naskah {regionData.name}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm uppercase font-bold tracking-wider text-[#0e2444]">
                Karakteristik &amp; Falsafah Tradisi
              </h3>
              <p className="text-sm leading-relaxed text-[#344454]">
                {regionData.summary}
              </p>

              <div className="space-y-3 pt-2">
                {regionData.culturalHighlights.map((hl, idx) => (
                  <div key={idx} className="p-3.5 bg-[#F3EFE7] rounded-xl border border-[#E7E0D4]">
                    <div className="text-xs font-bold text-[#0e2444] mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#9d422a] text-[16px]">verified</span>
                      <span>{hl.title}</span>
                    </div>
                    <div className="text-xs text-[#667483] leading-relaxed">
                      {hl.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F5DED6]/50 p-6 rounded-2xl border border-[#fd8c6e]/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9d422a] block mb-2">
                  Lembaga Rujukan Terverifikasi
                </span>
                <h4 className="text-base font-bold text-[#0e2444] mb-2">
                  Pusat Kajian Sastra Lisan &amp; Budaya Daerah
                </h4>
                <p className="text-xs leading-relaxed text-[#74240e] mb-4">
                  Dokumentasi cerita di wilayah ini diselaraskan bersama Balai Bahasa Daerah, Lembaga Adat Propinsi, dan arsip naskah kuno Balai Pustaka guna menjamin orisinalitas pesan moral leluhur.
                </p>
              </div>

              <div className="pt-4 border-t border-[#fd8c6e]/30 flex items-center justify-between">
                <button
                  onClick={onOpenGlossary}
                  className="text-xs font-bold text-[#9d422a] hover:text-[#0e2444] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">dictionary</span>
                  <span>Glosarium Istilah Daerah</span>
                </button>
                <button
                  onClick={() => onNavigate('tentang-&-sumber')}
                  className="text-xs font-semibold text-[#0e2444] hover:underline cursor-pointer"
                >
                  Etika Kurasi →
                </button>
              </div>
            </div>
          </div>

          {/* Featured Stories for this region */}
          <div>
            <h3 className="text-sm uppercase font-bold tracking-wider text-[#0e2444] mb-4">
              Naskah Cerita Pilihan di {regionData.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionStories.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-[#F3EFE7] rounded-xl text-xs text-[#667483]">
                  Naskah digital untuk wilayah ini sedang dalam tahap verifikasi etnofolklor tahap II. Kunjungi katalog untuk melihat naskah lainnya.
                </div>
              ) : (
                regionStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-[#FCFAF5] rounded-xl border border-[#E7E0D4] overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="relative aspect-16/9 bg-[#F3EFE7] overflow-hidden">
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded">
                        {story.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#0e2444] group-hover:text-[#9d422a] transition-colors mb-1">
                          {story.title}
                        </h4>
                        <p className="text-xs text-[#667483] line-clamp-2 mb-3">
                          {story.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E7E0D4] flex items-center justify-between text-xs">
                        <span className="text-[#667483]">{story.readingTimeMinutes} mnt baca</span>
                        <button
                          onClick={() => onNavigate('baca-cerita', story.id)}
                          className="font-bold text-[#9d422a] hover:text-[#0e2444] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Baca</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
