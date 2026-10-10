import React, { useState, useMemo } from 'react';
import { PageId, RegionKey, StoryTheme, TargetReader } from '../types';
import { STORIES } from '../data/stories';

interface CatalogPageProps {
  onNavigate: (page: PageId, storyId?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenGlossary: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenGlossary
}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('all');
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>('all');
  const [selectedReader, setSelectedReader] = useState<TargetReader>('all');
  const [sortBy, setSortBy] = useState<'populer' | 'terbaru' | 'durasi' | 'az'>('populer');
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  const regionCounts: Record<string, number> = {
    all: 84,
    sumatera: 18,
    jawa: 24,
    kalimantan: 12,
    sulawesi: 15,
    'bali-nusa': 14,
    'maluku-papua': 16,
  };

  const filteredStories = useMemo(() => {
    return STORIES.filter((story) => {
      // Region match
      if (selectedRegion !== 'all') {
        if (selectedRegion === 'bali-nusa' && story.regionKey !== 'balinusra') return false;
        else if (selectedRegion === 'maluku-papua' && !['maluku', 'papua'].includes(story.regionKey)) return false;
        else if (selectedRegion !== 'bali-nusa' && selectedRegion !== 'maluku-papua' && story.regionKey !== selectedRegion) return false;
      }

      // Theme match
      if (selectedTheme !== 'all') {
        if (selectedTheme === 'kepahlawanan' && !['epos', 'kesetiaan'].includes(story.theme)) return false;
        if (selectedTheme === 'kebijaksanaan' && !['moral', 'alam'].includes(story.theme)) return false;
        if (selectedTheme === 'asal-usul' && !['asal-usul', 'alam'].includes(story.theme)) return false;
        if (selectedTheme === 'satwa' && story.theme !== 'satwa') return false;
      }

      // Reader level match
      if (selectedReader !== 'all' && story.targetReader !== selectedReader) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = story.title.toLowerCase().includes(q);
        const inRegion = story.region.toLowerCase().includes(q);
        const inCategory = story.category.toLowerCase().includes(q);
        const inSummary = story.summary.toLowerCase().includes(q);
        const inTradition = story.tradition.toLowerCase().includes(q);
        if (!inTitle && !inRegion && !inCategory && !inSummary && !inTradition) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'populer') return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === 'durasi') return a.readingTimeMinutes - b.readingTimeMinutes;
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [selectedRegion, selectedTheme, selectedReader, searchQuery, sortBy]);

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
          <span className="text-[#0e2444] font-semibold">Katalog Cerita</span>
        </nav>

        {/* Header Title Section */}
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a] block mb-1">
            Koleksi Terkurasi Folklor Nusantara
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e2444] tracking-tight leading-tight mb-3">
            Telusuri Hikayat & Legenda dari Sabang sampai Merauke
          </h1>
          <p className="text-[#667483] text-sm sm:text-base leading-relaxed">
            Setiap naskah dilengkapi dengan anotasi budaya, konteks adat setempat, dan verifikasi asal-usul sastra lisan oleh tim kurator kebudayaan.
          </p>
        </div>

        {/* Search & Filter Container */}
        <div className="bg-[#F3EFE7] rounded-2xl p-4 sm:p-6 border border-[#E7E0D4] mb-8 shadow-xs">
          {/* Top: Search Input */}
          <div className="relative mb-5">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-[#667483] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari berdasarkan judul naskah, tokoh, nilai moral, atau wilayah..."
              className="w-full bg-[#FCFAF5] border border-[#E7E0D4] focus:border-[#9d422a] rounded-xl pl-12 pr-10 py-3 text-sm text-[#131c26] placeholder:text-[#667483] focus:outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-3 text-[#667483] hover:text-[#0e2444]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Region Tabs (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {[
              { key: 'all', label: 'Semua Wilayah', count: regionCounts.all },
              { key: 'sumatera', label: 'Sumatera', count: regionCounts.sumatera },
              { key: 'jawa', label: 'Jawa', count: regionCounts.jawa },
              { key: 'kalimantan', label: 'Kalimantan', count: regionCounts.kalimantan },
              { key: 'sulawesi', label: 'Sulawesi', count: regionCounts.sulawesi },
              { key: 'bali-nusa', label: 'Bali & Nusa Tenggara', count: regionCounts['bali-nusa'] },
              { key: 'maluku-papua', label: 'Maluku & Papua', count: regionCounts['maluku-papua'] },
            ].map((reg) => (
              <button
                key={reg.key}
                onClick={() => setSelectedRegion(reg.key as RegionKey)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === reg.key
                    ? 'bg-[#0e2444] text-white shadow-xs'
                    : 'bg-[#FCFAF5] text-[#344454] border border-[#E7E0D4] hover:bg-[#E7E0D4]'
                }`}
              >
                {reg.label} <span className="opacity-70 font-normal">({reg.count})</span>
              </button>
            ))}
          </div>

          {/* Sub Filters: Theme, Reader Level, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7E0D4]">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Theme filter */}
              <div className="flex items-center gap-1.5 bg-[#FCFAF5] px-3 py-1.5 rounded-lg border border-[#E7E0D4] text-xs">
                <span className="material-symbols-outlined text-[16px] text-[#667483]">category</span>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value as StoryTheme)}
                  className="bg-transparent text-[#0e2444] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Tema</option>
                  <option value="kepahlawanan">Kepahlawanan & Perjuangan</option>
                  <option value="kebijaksanaan">Kebijaksanaan Alam</option>
                  <option value="asal-usul">Asal-Usul Tempat</option>
                  <option value="satwa">Satwa Mitos & Falsafah</option>
                </select>
              </div>

              {/* Reader level filter */}
              <div className="flex items-center gap-1.5 bg-[#FCFAF5] px-3 py-1.5 rounded-lg border border-[#E7E0D4] text-xs">
                <span className="material-symbols-outlined text-[16px] text-[#667483]">school</span>
                <select
                  value={selectedReader}
                  onChange={(e) => setSelectedReader(e.target.value as TargetReader)}
                  className="bg-transparent text-[#0e2444] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Jenjang</option>
                  <option value="smp">SMP / Remaja Awal (12-15 th)</option>
                  <option value="sma">SMA / Umum (16+ th)</option>
                </select>
              </div>

              {(selectedRegion !== 'all' || selectedTheme !== 'all' || selectedReader !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedRegion('all');
                    setSelectedTheme('all');
                    setSelectedReader('all');
                    onSearchChange('');
                  }}
                  className="text-xs text-[#9d422a] hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#667483] font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FCFAF5] border border-[#E7E0D4] text-[#0e2444] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="populer">Terpopuler</option>
                <option value="durasi">Durasi Membaca Cepat</option>
                <option value="az">Abjad (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meta Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667483] mb-6">
          <div>
            Menampilkan <strong className="text-[#0e2444] font-bold">{filteredStories.length}</strong> naskah terverifikasi
            {selectedRegion !== 'all' && <span> di wilayah terpilih</span>}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-[#0e2444]">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>Berasal dari Naskah Lisan &amp; Manuskrip Daerah</span>
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-20 bg-[#F3EFE7] rounded-2xl border border-[#E7E0D4]">
            <span className="material-symbols-outlined text-5xl text-[#90a4cb] mb-3">menu_book</span>
            <h3 className="text-lg font-bold text-[#0e2444] mb-1">Naskah Tidak Ditemukan</h3>
            <p className="text-sm text-[#667483] max-w-md mx-auto mb-4">
              Tidak ada cerita yang cocok dengan kombinasi filter atau kata kunci pencarian Anda saat ini.
            </p>
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSelectedTheme('all');
                setSelectedReader('all');
                onSearchChange('');
              }}
              className="bg-[#0e2444] text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Kembalikan Semua Koleksi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-[#FCFAF5] rounded-2xl border border-[#E7E0D4] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                {/* Image Cover */}
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
                    <span className="material-symbols-outlined text-[13px]">timer</span>
                    <span>{story.readingTimeMinutes} mnt baca</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#667483] font-medium mb-2">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#9d422a]">location_on</span>
                        <span>{story.region}</span>
                      </div>
                      <span className="text-[11px] bg-[#F3EFE7] px-2 py-0.5 rounded font-semibold text-[#0e2444]">
                        {story.sceneCount} Adegan
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#0e2444] group-hover:text-[#9d422a] transition-colors mb-2.5 leading-snug">
                      {story.title}
                    </h3>

                    <p className="text-[#667483] text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                      {story.summary}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#0e2444] bg-[#F5DED6]/60 p-2.5 rounded-lg mb-4 font-medium">
                      🏛️ <strong>Tradisi:</strong> {story.tradition}
                    </div>

                    <div className="pt-3 border-t border-[#E7E0D4] flex items-center justify-between">
                      <span className="text-[11px] text-[#667483]">
                        ⭐ {story.rating} ({story.reviewCount} ulasan)
                      </span>
                      <button
                        onClick={() => onNavigate('baca-cerita', story.id)}
                        className="bg-[#0e2444] group-hover:bg-[#9d422a] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Baca Cerita</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#E7E0D4] mb-12">
          <button
            onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
            disabled={currentPageNum === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E7E0D4] bg-[#FCFAF5] text-[#0e2444] hover:bg-[#F3EFE7] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Halaman Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPageNum(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPageNum === page
                    ? 'bg-[#0e2444] text-white'
                    : 'text-[#0e2444] hover:bg-[#F3EFE7]'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-[#667483]">...</span>
            <button
              onClick={() => setCurrentPageNum(14)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                currentPageNum === 14 ? 'bg-[#0e2444] text-white' : 'text-[#0e2444] hover:bg-[#F3EFE7]'
              }`}
            >
              14
            </button>
          </div>

          <button
            onClick={() => setCurrentPageNum(Math.min(14, currentPageNum + 1))}
            disabled={currentPageNum === 14}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E7E0D4] bg-[#FCFAF5] text-[#0e2444] hover:bg-[#F3EFE7] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <span>Halaman Berikutnya</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Cultural Context Ribbon (Glossary Callout) */}
        <div className="bg-[#F5DED6] rounded-2xl p-6 sm:p-8 border border-[#fd8c6e]/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#9d422a] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#9d422a] mb-1">
                Tahukah Anda?
              </div>
              <h4 className="text-lg font-bold text-[#0e2444] mb-1">
                Istilah &amp; Bahasa Daerah Tersedia Lengkap
              </h4>
              <p className="text-xs sm:text-sm text-[#74240e] leading-relaxed max-w-xl">
                Setiap naskah cerita menyertakan penjelasan istilah adat arkais seperti <em>Tadulako</em>, <em>Lontara</em>, hingga <em>Gejog Lesung</em> agar pembaca muda memahami konteks luhurnya.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenGlossary}
              className="bg-[#9d422a] hover:bg-[#0e2444] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">dictionary</span>
              <span>Buka Glosarium Istilah</span>
            </button>
            <button
              onClick={() => onNavigate('tentang-&-sumber')}
              className="text-xs font-bold text-[#0e2444] hover:underline cursor-pointer"
            >
              Pedoman Verifikasi Naskah →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
