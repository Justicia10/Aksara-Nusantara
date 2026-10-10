import React from 'react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenGlossary?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenGlossary }) => {
  return (
    <footer className="bg-[#0e2444] text-white pt-16 pb-12 border-t border-[#263a5b]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#263a5b]">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                alt="Logo Nusantara Gemar Membaca"
                className="h-8 w-auto brightness-200 contrast-125 object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1V0A4Vfxojv5Zazswh-3cPJaUBfyNMdnE2lhQt7ygicLNDw8KTtrj8cdhpGzdsOvHopd7vHLoNL3W6WkpttpDmVFVkDDKojIbU1q4ciJMOrMo_F0QoUnBcU6XM_P66IRw9eUqDwh74v4BsMsH-cK53D1JTFJ2WFDEpjPL70GKddYnvryl2wwOCyUFHWuvJh25ubUZkDZd5JSovSOlOZAKSC_whloJ2ZuwFE0jkqOOCJtf9oGJdLN2eC167I"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-bold text-[18px] tracking-tight text-white">
                Nusantara Gemar Membaca
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-[#90a4cb] max-w-sm">
              Platform membaca dan eksplorasi folklor Nusantara terkurasi untuk generasi muda. Menghidupkan kembali kearifan lokal melalui narasi yang kaya konteks budaya, etnofolklor terverifikasi, dan visual interpretatif.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#90a4cb]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Naskah terkurasi dengan sumber yang dapat ditelusuri</span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[12px] uppercase font-bold tracking-widest text-[#fd8c6e]">
              Jelajah Arsip
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer"
                >
                  Katalog Semua Naskah
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('peta-nusantara')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer"
                >
                  Peta Interaktif Wilayah
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer"
                >
                  Gugus Sumatera & Swarnadwipa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer"
                >
                  Gugus Jawa & Madura
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer"
                >
                  Gugus Kalimantan & Sulawesi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('katalog-cerita')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer"
                >
                  Gugus Maluku & Papua
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[12px] uppercase font-bold tracking-widest text-[#fd8c6e]">
              Inisiatif Literasi & Etika
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <button
                  onClick={() => onNavigate('tentang-&-sumber')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pedoman Verifikasi Etnofolklor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tentang-&-sumber')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sumber & Rujukan Naskah Klasik
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tentang-&-sumber')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pernyataan Kurasi Visual AI (P2 Model)
                </button>
              </li>
              {onOpenGlossary && (
                <li>
                  <button
                    onClick={onOpenGlossary}
                    className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#fd8c6e]">dictionary</span>
                    Glosarium Istilah & Bahasa Daerah
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onNavigate('tentang-&-sumber')}
                  className="text-[#90a4cb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  Panduan Guru & Media Pembelajaran
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#90a4cb]">
          <div>
            &copy; {new Date().getFullYear()} Nusantara Gemar Membaca. Bagian dari Inisiatif Literasi Kebudayaan Terbuka.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('tentang-&-sumber')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kebijakan Kurasi
            </button>
            <button
              onClick={() => onNavigate('tentang-&-sumber')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Hak Cipta Naskah
            </button>
            <button
              onClick={() => onNavigate('tentang-&-sumber')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Hubungi Dewan Kurator
            </button>
            <button
              onClick={() => onNavigate('admin')}
              data-testid="footer-admin"
              className="hover:text-white transition-colors cursor-pointer opacity-70"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
