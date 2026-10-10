import React, { useState } from 'react';
import { PageId } from '../types';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId, storyId?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenGlossary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenGlossary
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage !== 'katalog-cerita') {
      onNavigate('katalog-cerita');
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FCFAF5]/90 backdrop-blur-md shadow-[0_1px_8px_rgba(23,32,42,0.04)] border-b border-[#E7E0D4]/60">
      <div className="h-20 w-full px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-6">
        {/* Brand */}
        <button
          onClick={() => onNavigate('beranda')}
          className="flex items-center gap-3 shrink-0 text-left cursor-pointer group"
        >
          <img
            alt="Logo Nusantara Gemar Membaca"
            className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AEtjO1V0A4Vfxojv5Zazswh-3cPJaUBfyNMdnE2lhQt7ygicLNDw8KTtrj8cdhpGzdsOvHopd7vHLoNL3W6WkpttpDmVFVkDDKojIbU1q4ciJMOrMo_F0QoUnBcU6XM_P66IRw9eUqDwh74v4BsMsH-cK53D1JTFJ2WFDEpjPL70GKddYnvryl2wwOCyUFHWuvJh25ubUZkDZd5JSovSOlOZAKSC_whloJ2ZuwFE0jkqOOCJtf9oGJdLN2eC167I"
            onError={(e) => {
              // fallback if external hotlink has restriction
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-bold text-[18px] leading-[22px] text-[#0e2444] tracking-tight group-hover:text-[#9d422a] transition-colors">
              Nusantara Gemar Membaca
            </span>
            <span className="text-[12px] leading-[16px] text-[#667483] hidden sm:inline-block font-medium">
              Gerakan Literasi Cerita Rakyat
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navigasi Utama">
          <button
            onClick={() => onNavigate('beranda')}
            className={`px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-colors cursor-pointer ${
              currentPage === 'beranda'
                ? 'bg-[#F3EFE7] text-[#0e2444] shadow-sm'
                : 'text-[#44474e] hover:bg-[#F3EFE7] hover:text-[#0e2444]'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onNavigate('katalog-cerita')}
            className={`px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-colors cursor-pointer ${
              currentPage === 'katalog-cerita'
                ? 'bg-[#F3EFE7] text-[#0e2444] shadow-sm'
                : 'text-[#44474e] hover:bg-[#F3EFE7] hover:text-[#0e2444]'
            }`}
          >
            Katalog Cerita
          </button>
          <button
            onClick={() => onNavigate('peta-nusantara')}
            className={`px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-colors cursor-pointer ${
              currentPage === 'peta-nusantara'
                ? 'bg-[#F3EFE7] text-[#0e2444] shadow-sm'
                : 'text-[#44474e] hover:bg-[#F3EFE7] hover:text-[#0e2444]'
            }`}
          >
            Peta Nusantara
          </button>
          <button
            onClick={() => onNavigate('tentang-&-sumber')}
            className={`px-3.5 py-2 text-[14px] font-semibold rounded-lg transition-colors cursor-pointer ${
              currentPage === 'tentang-&-sumber'
                ? 'bg-[#F3EFE7] text-[#0e2444] shadow-sm'
                : 'text-[#44474e] hover:bg-[#F3EFE7] hover:text-[#0e2444]'
            }`}
          >
            Tentang & Sumber
          </button>
        </nav>

        {/* Right Section: Search & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-[#F3EFE7] rounded-xl px-3 py-1.5 gap-2 border border-transparent focus-within:border-[#0e2444]/20 focus-within:bg-[#FCFAF5] transition-all">
            <span className="material-symbols-outlined text-[#667483] text-[18px]">search</span>
            <input
              className="bg-transparent text-[14px] text-[#131c26] placeholder:text-[#667483] focus:outline-none w-32 xl:w-52"
              placeholder="Cari cerita atau tokoh..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-[#667483] hover:text-[#0e2444]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </form>

          {onOpenGlossary && (
            <button
              onClick={onOpenGlossary}
              title="Kamus Istilah Budaya"
              className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-[#0e2444] bg-[#F3EFE7] hover:bg-[#F5DED6] hover:text-[#9d422a] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#9d422a]">menu_book</span>
              <span className="hidden xl:inline">Glosarium</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('katalog-cerita')}
            className="inline-flex items-center justify-center bg-[#9d422a] text-white px-4 sm:px-5 py-2 rounded-xl text-[14px] font-semibold transition-all hover:bg-[#0e2444] shadow-[0_2px_6px_-1px_rgba(23,32,42,0.12)] cursor-pointer"
          >
            Mulai Menjelajah
          </button>

          <div
            title="Akun Pembaca Terdaftar"
            className="w-8 h-8 rounded-full bg-[#0e2444] text-white flex items-center justify-center shrink-0 shadow-sm cursor-default"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#0e2444] hover:bg-[#F3EFE7] transition-colors"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFAF5] border-b border-[#E7E0D4] px-6 py-4 flex flex-col gap-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#F3EFE7] rounded-xl px-3 py-2 gap-2">
            <span className="material-symbols-outlined text-[#667483] text-[18px]">search</span>
            <input
              className="bg-transparent text-[14px] text-[#131c26] placeholder:text-[#667483] focus:outline-none w-full"
              placeholder="Cari cerita, tokoh, atau falsafah..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </form>

          <button
            onClick={() => { onNavigate('beranda'); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-lg text-[15px] font-semibold ${
              currentPage === 'beranda' ? 'bg-[#F3EFE7] text-[#0e2444]' : 'text-[#44474e]'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => { onNavigate('katalog-cerita'); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-lg text-[15px] font-semibold ${
              currentPage === 'katalog-cerita' ? 'bg-[#F3EFE7] text-[#0e2444]' : 'text-[#44474e]'
            }`}
          >
            Katalog Cerita
          </button>
          <button
            onClick={() => { onNavigate('peta-nusantara'); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-lg text-[15px] font-semibold ${
              currentPage === 'peta-nusantara' ? 'bg-[#F3EFE7] text-[#0e2444]' : 'text-[#44474e]'
            }`}
          >
            Peta Nusantara
          </button>
          <button
            onClick={() => { onNavigate('tentang-&-sumber'); setMobileMenuOpen(false); }}
            className={`text-left px-3 py-2 rounded-lg text-[15px] font-semibold ${
              currentPage === 'tentang-&-sumber' ? 'bg-[#F3EFE7] text-[#0e2444]' : 'text-[#44474e]'
            }`}
          >
            Tentang & Sumber
          </button>
          {onOpenGlossary && (
            <button
              onClick={() => { onOpenGlossary(); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-[15px] font-semibold text-[#9d422a] bg-[#F5DED6]/70 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Kamus Istilah Adat
            </button>
          )}
        </div>
      )}
    </header>
  );
};
