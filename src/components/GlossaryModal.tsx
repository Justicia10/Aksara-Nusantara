import React, { useState } from 'react';
import { GLOSSARY_TERMS } from '../data/glossary';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInitialTerm?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  selectedInitialTerm
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = GLOSSARY_TERMS.filter((item) => {
    const matchSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.meaning.toLowerCase().includes(search.toLowerCase()) ||
      item.culturalContext.toLowerCase().includes(search.toLowerCase());
    const matchRegion =
      selectedRegion === 'all' || item.region.toLowerCase().includes(selectedRegion.toLowerCase());
    return matchSearch && matchRegion;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#FCFAF5] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-[#E7E0D4] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#F3EFE7] border-b border-[#E7E0D4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#9d422a] text-[24px]">menu_book</span>
            <div>
              <h3 className="font-bold text-lg text-[#0e2444]">Glosarium Istilah Adat Nusantara</h3>
              <p className="text-xs text-[#667483]">Kamus rujukan etnofolklor dan bahasa daerah terverifikasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667483] hover:text-[#0e2444] hover:bg-[#E7E0D4]/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-[#E7E0D4] bg-[#FCFAF5] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#667483] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari istilah, seperti Gejog Lesung, Tadulako..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F3EFE7] border border-transparent focus:border-[#9d422a] rounded-xl focus:outline-none"
            />
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-[#F3EFE7] border border-transparent rounded-xl text-[#0e2444] focus:outline-none"
          >
            <option value="all">Semua Daerah</option>
            <option value="Jawa">Jawa & Yogyakarta</option>
            <option value="Sulawesi">Sulawesi</option>
            <option value="Sumatera">Sumatera</option>
            <option value="Maluku">Maluku</option>
            <option value="Papua">Papua</option>
          </select>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[#667483]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#90a4cb]">search_off</span>
              <p className="text-sm">Tidak ditemukan istilah adat yang cocok.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isHighlight = selectedInitialTerm && selectedInitialTerm.toLowerCase() === item.term.toLowerCase();
              return (
                <div
                  key={item.term}
                  className={`p-4 rounded-xl border transition-all ${
                    isHighlight
                      ? 'bg-[#F5DED6] border-[#9d422a]/40 shadow-xs'
                      : 'bg-[#F3EFE7]/70 border-[#E7E0D4] hover:bg-[#F3EFE7]'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1.5 gap-2">
                    <span className="font-bold text-[16px] text-[#0e2444]">{item.term}</span>
                    <span className="text-[11px] font-semibold text-[#9d422a] bg-[#F5DED6] px-2 py-0.5 rounded-md">
                      {item.region}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[#344454] mb-2">{item.meaning}</p>
                  <p className="text-[12px] leading-relaxed text-[#667483] border-t border-[#E7E0D4]/80 pt-2 italic">
                    💡 Konteks Budaya: {item.culturalContext}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#F3EFE7] border-t border-[#E7E0D4] flex items-center justify-between text-[11px] text-[#667483]">
          <span>Rujukan: Balai Pustaka & Pusat Pembinaan Bahasa Kemendikbudristek</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#0e2444] text-white rounded-lg hover:bg-[#1D2E49] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
