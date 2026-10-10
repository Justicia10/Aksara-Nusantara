import React, { useState } from 'react';
import { PageId, Story } from '../types';
import { STORIES } from '../data/stories';
import { REGIONS } from '../data/regions';

interface HomePageProps {
  onNavigate: (page: PageId, storyId?: string) => void;
  onSelectRegion?: (regionKey: string) => void;
  onOpenGlossary?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectRegion,
  onOpenGlossary
}) => {
  const [selectedArchipelagoKey, setSelectedArchipelagoKey] = useState<string>('sulawesi');
  const [homeSearch, setHomeSearch] = useState('');

  const featuredStory = STORIES[0]; // Roro Jonggrang
  const curatedStories = STORIES.filter(s => ['danau-toba', 'sawerigading', 'cenderawasih'].includes(s.id));
  const activeRegionData = REGIONS[selectedArchipelagoKey] || REGIONS['sulawesi'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('katalog-cerita');
  };

  return (
    <div className="min-h-screen bg-[#FCFAF5] pt-20">
      {/* Topographic Lines Decor Background */}
      <div className="relative overflow-hidden">
        {/* Subtle decorative background topography */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200 C300 100 600 350 1000 220 C1300 120 1500 280 1600 250" stroke="#E7E0D4" strokeWidth="1.5" strokeDasharray="6 6" fill="none"/>
            <path d="M-50 350 C350 220 700 480 1100 300 C1350 200 1550 400 1650 360" stroke="#E7E0D4" strokeWidth="1.5" strokeDasharray="8 8" fill="none"/>
          </svg>
        </div>

        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EFE7] border border-[#E7E0D4] mb-6">
              <span className="material-symbols-outlined text-[16px] text-[#9d422a]">local_library</span>
              <span className="text-[12px] font-bold tracking-wide uppercase text-[#0e2444]">
                Gerakan Literasi Cerita Rakyat Nusantara
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0e2444] leading-[1.15] mb-6">
              Menghidupkan Kembali{' '}
              <span className="text-[#9d422a] italic font-serif">Kearifan Leluhur</span>{' '}
              Lewat Membaca
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#667483] leading-relaxed mb-8 max-w-2xl">
              Eksplorasi cerita rakyat Nusantara yang dikurasi secara mendalam dengan konteks adat, riset etnofolklor, dan visual interpretatif modern untuk generasi baru.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button
                onClick={() => onNavigate('katalog-cerita')}
                className="inline-flex items-center gap-2 bg-[#0e2444] hover:bg-[#1D2E49] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Jelajahi Cerita</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <button
                onClick={() => onNavigate('peta-nusantara')}
                className="inline-flex items-center gap-2 bg-[#F3EFE7] hover:bg-[#E7E0D4] text-[#0e2444] font-semibold px-6 py-3.5 rounded-xl transition-all border border-[#E7E0D4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-[#9d422a]">map</span>
                <span>Buka Peta Wilayah</span>
              </button>
            </div>

            {/* Micro Stats Ticker */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 border-t border-[#E7E0D4] w-full max-w-xl text-left sm:text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2444]">120+</div>
                <div className="text-xs sm:text-sm text-[#667483] font-medium">Cerita Arsip Terkurasi</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2444]">38</div>
                <div className="text-xs sm:text-sm text-[#667483] font-medium">Provinsi Terwakili</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#9d422a]">100%</div>
                <div className="text-xs sm:text-sm text-[#667483] font-medium">Rujukan Balai Pustaka</div>
              </div>
            </div>
          </div>
        </section>

        {/* HERO SPOTLIGHT CARD */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
          <div className="bg-[#0e2444] rounded-3xl overflow-hidden shadow-2xl text-white border border-[#263a5b] grid grid-cols-1 lg:grid-cols-12">
            {/* Image Col */}
            <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] overflow-hidden group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnIsulsgHS78QMXrLeRAyZmRGfeZbJyq_LfeVaTE9YHYntwEy5vET1CqryXfMfbgIz9peXkSUfiwpxqTPgXSLmFm8sIzFRi4PDDAXr0rZWoDhT1fdStd1k7xyImgwL7L_nfQF5I_JKAH-sxbt9POI_uxJy1eZE2_q7fAJN4cVT7wXCZbknS7Q3raCy0LSOBWY-gR7WbN0YF7PMrBmz3s0LZTKWFDu2EfqQ9R0p4jfRMcJZ03kHoXNBpg"
                alt="Roro Jonggrang Prambanan temple sunset"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e2444] via-[#0e2444]/30 to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 bg-[#9d422a] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                <span>Cerita Unggulan Pekan Ini</span>
              </div>
            </div>

            {/* Content Col */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-[#0e2444] to-[#1D2E49]">
              <div>
                <div className="flex items-center gap-2 text-[#fd8c6e] text-xs font-bold tracking-wider uppercase mb-2">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>DI Yogyakarta • Kompleks Candi Sewu</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 leading-snug">
                  Roro Jonggrang: Seribu Candi di Bawah Bulan Purnama
                </h2>

                <p className="text-[#90a4cb] text-sm sm:text-base leading-relaxed mb-6">
                  Kecerdikan putri Prambanan menghadapi pinangan Bandung Bondowoso. Taktik menyalakan jerami fajar yang melahirkan arca Durga Mahisasuramardini ke seribu.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-[#263a5b] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#fd8c6e]">timer</span>
                    8 Menit Baca
                  </span>
                  <span className="bg-[#263a5b] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Legenda Arsitektur
                  </span>
                  <span className="bg-[#263a5b] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Tradisi Mataram Kuno
                  </span>
                </div>

                {/* Cultural Focus Quote */}
                <div className="bg-[#263a5b]/60 border-l-4 border-[#fd8c6e] p-4 rounded-r-xl mb-8">
                  <p className="text-xs text-[#dae3f1] italic leading-relaxed">
                    <strong className="text-white not-italic font-semibold">Fokus Etnografis:</strong> Mengulas fungsi filosofis &quot;Gejog Lesung&quot; penumbuk padi sebagai sinyal sosial fajar di pedesaan Jawa agraris.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate('baca-cerita', 'roro-jonggrang')}
                  className="flex-1 bg-[#9d422a] hover:bg-[#b54f35] text-white font-semibold py-3.5 px-6 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Mulai Membaca</span>
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </button>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="p-3.5 bg-[#263a5b] hover:bg-[#344454] rounded-xl text-white transition-colors cursor-pointer"
                  title="Lihat di Katalog"
                >
                  <span className="material-symbols-outlined text-[20px]">bookmark</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CURATED STORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-[#E7E0D4]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a]">
              Pilihan Kurator
            </span>
            <h2 className="text-3xl font-bold text-[#0e2444] tracking-tight mt-1">
              Koleksi Terkurasi
            </h2>
          </div>

          <button
            onClick={() => onNavigate('katalog-cerita')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0e2444] hover:text-[#9d422a] transition-colors cursor-pointer group"
          >
            <span>Lihat Semua (84)</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        {/* 3 Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {curatedStories.map((story) => (
            <div
              key={story.id}
              className="bg-[#FCFAF5] rounded-2xl border border-[#E7E0D4] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#F3EFE7]">
                <img
                  src={story.imageUrl}
                  alt={story.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0e2444]/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {story.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  <span>{story.readingTimeMinutes} Menit</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#667483] font-medium mb-2">
                    <span className="material-symbols-outlined text-[14px] text-[#9d422a]">location_on</span>
                    <span>{story.locationDetail}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0e2444] group-hover:text-[#9d422a] transition-colors mb-2.5 leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-[#667483] text-sm leading-relaxed mb-4 line-clamp-2">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E7E0D4] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0e2444] bg-[#F3EFE7] px-2.5 py-1 rounded-md">
                    {story.tradition}
                  </span>

                  <button
                    onClick={() => onNavigate('baca-cerita', story.id)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#9d422a] hover:text-[#0e2444] transition-colors cursor-pointer"
                  >
                    <span>Baca Kisah</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHIPELAGO INTERACTIVE EXPLORER PREVIEW */}
      <section className="bg-[#F3EFE7] py-16 border-y border-[#E7E0D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a]">
              Peta Etnofolklor
            </span>
            <h2 className="text-3xl font-bold text-[#0e2444] tracking-tight mt-1 mb-3">
              Jelajahi Cerita Berdasarkan Gugus Kepulauan
            </h2>
            <p className="text-[#667483] text-sm sm:text-base">
              Setiap bentang pulau memelihara cara pandang unik terhadap manusia, roh, dan alam semesta. Pilih pulau untuk menelusuri arsipnya.
            </p>
          </div>

          {/* Island selector chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { key: 'sumatera', label: 'Sumatera (18)' },
              { key: 'jawa', label: 'Jawa & Madura (24)' },
              { key: 'kalimantan', label: 'Kalimantan (12)' },
              { key: 'sulawesi', label: 'Sulawesi (15)' },
              { key: 'balinusra', label: 'Bali & Nusra (14)' },
              { key: 'maluku', label: 'Maluku (8)' },
              { key: 'papua', label: 'Papua (8)' },
            ].map((isl) => (
              <button
                key={isl.key}
                onClick={() => setSelectedArchipelagoKey(isl.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedArchipelagoKey === isl.key
                    ? 'bg-[#0e2444] text-white shadow-sm'
                    : 'bg-[#FCFAF5] text-[#344454] border border-[#E7E0D4] hover:bg-[#E7E0D4]'
                }`}
              >
                {isl.label}
              </button>
            ))}
          </div>

          {/* Region interactive card */}
          <div className="bg-[#FCFAF5] rounded-3xl p-6 sm:p-8 border border-[#E7E0D4] shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9d422a] bg-[#F5DED6] px-2.5 py-1 rounded-md">
                  {activeRegionData.badge}
                </span>
                <span className="text-xs text-[#667483] font-medium">{activeRegionData.provinces}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0e2444] mb-3">
                {activeRegionData.title}
              </h3>
              <p className="text-[#667483] text-sm sm:text-base leading-relaxed mb-6">
                {activeRegionData.summary}
              </p>

              <div className="space-y-2.5 mb-6">
                {activeRegionData.culturalHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-[#9d422a] text-[18px] shrink-0 mt-0.5">verified</span>
                    <div>
                      <strong className="text-[#0e2444]">{hl.title}:</strong>{' '}
                      <span className="text-[#667483]">{hl.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    if (onSelectRegion) onSelectRegion(activeRegionData.key);
                    onNavigate('peta-nusantara');
                  }}
                  className="bg-[#9d422a] hover:bg-[#0e2444] text-white font-semibold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 text-sm cursor-pointer shadow-sm"
                >
                  <span>Buka Peta Interaktif Lengkap</span>
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                </button>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="text-[#0e2444] hover:text-[#9d422a] font-bold text-sm inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat {activeRegionData.storyCount} Naskah Terkait</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F3EFE7] rounded-2xl p-6 border border-[#E7E0D4] flex flex-col justify-center">
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#667483] mb-4">
                Naskah Terkemuka dari {activeRegionData.name}
              </h4>
              <div className="space-y-3">
                {activeRegionData.featuredStoryIds.slice(0, 3).map((sId) => {
                  const s = STORIES.find(st => st.id === sId);
                  if (!s) return null;
                  return (
                    <div
                      key={s.id}
                      onClick={() => onNavigate('baca-cerita', s.id)}
                      className="p-3 bg-[#FCFAF5] rounded-xl border border-[#E7E0D4] hover:border-[#9d422a]/40 hover:shadow-sm transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={s.imageUrl}
                          alt={s.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-sm text-[#0e2444] group-hover:text-[#9d422a] transition-colors line-clamp-1">
                            {s.title}
                          </div>
                          <div className="text-xs text-[#667483]">{s.category} • {s.readingTimeMinutes} mnt</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#667483] group-hover:text-[#9d422a] group-hover:translate-x-0.5 transition-all text-[20px]">
                        arrow_forward
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL CONTEXT & SOURCE BADGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="bg-[#0e2444] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fd8c6e] mb-2 inline-block">
              Sorotan Konteks Budaya
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Bukan Sekadar Dongeng Pengantar Tidur
            </h2>
            <p className="text-[#90a4cb] text-base leading-relaxed mb-8">
              Folklor Nusantara menyimpan sandi peradaban: pranata hukum adat, mitigasi bencana ekologi purba, serta filosofi gotong royong yang relevan untuk tantangan masa kini.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              <span className="bg-[#263a5b] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                🌿 Filosofi Sirih Pinang
              </span>
              <span className="bg-[#263a5b] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                ⛵ Navigasi Perbintangan Bugis
              </span>
              <span className="bg-[#263a5b] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                🌊 Hukum Sasi Laut Maluku
              </span>
              <span className="bg-[#263a5b] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                🌾 Gejog Lesung & Subak
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('tentang-&-sumber')}
                className="bg-[#fd8c6e] hover:bg-[#9d422a] text-[#0e2444] hover:text-white font-bold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer shadow-md"
              >
                Pelajari Metodologi Etnofolklor
              </button>

              {onOpenGlossary && (
                <button
                  onClick={onOpenGlossary}
                  className="text-white hover:text-[#fd8c6e] font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
                >
                  <span className="material-symbols-outlined text-[18px]">dictionary</span>
                  Buka Glosarium Istilah Adat
                </button>
              )}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-15 pointer-events-none hidden md:block">
            <span className="material-symbols-outlined text-[280px]">history_edu</span>
          </div>
        </div>
      </section>

      {/* QUICK SEARCH & CALLOUT */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-20 text-center">
        <div className="bg-[#F3EFE7] rounded-2xl p-8 border border-[#E7E0D4]">
          <h3 className="text-xl font-bold text-[#0e2444] mb-2">
            Cari Kisah atau Tokoh Tertentu?
          </h3>
          <p className="text-xs sm:text-sm text-[#667483] mb-5">
            Ketik kata kunci nilai moral, nama raja, daerah asal, atau fenomena alam
          </p>

          <form onSubmit={handleSearchSubmit} className="flex max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#667483] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Misal: Kejujuran, Sawerigading, Danau Toba..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FCFAF5] border border-[#E7E0D4] focus:border-[#9d422a] rounded-xl focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#0e2444] hover:bg-[#1D2E49] text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer shrink-0"
            >
              Cari
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#667483]">
            <span>Pencarian populer:</span>
            {['Malin Kundang', 'Roro Jonggrang', 'Sawerigading', 'Lembuswana', 'Putri Hijau'].map((tag) => (
              <button
                key={tag}
                onClick={() => onNavigate('katalog-cerita')}
                className="hover:text-[#9d422a] hover:underline cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
