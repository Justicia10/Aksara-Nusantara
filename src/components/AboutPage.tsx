import React, { useState } from 'react';
import { PageId } from '../types';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  onOpenGlossary: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenGlossary }) => {
  const [submissionName, setSubmissionName] = useState('');
  const [submissionRegion, setSubmissionRegion] = useState('');
  const [submissionStory, setSubmissionStory] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubmissionName('');
      setSubmissionRegion('');
      setSubmissionStory('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF5] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#667483] mb-4">
          <button
            onClick={() => onNavigate('beranda')}
            className="hover:text-[#0e2444] transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0e2444] font-semibold">Tentang &amp; Sumber</span>
        </nav>

        {/* Hero Banner */}
        <div className="bg-[#0e2444] text-white rounded-3xl p-8 sm:p-12 mb-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fd8c6e] mb-2 inline-block">
              Inisiatif Literasi Kebudayaan Terbuka
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Menjaga Nyala Tutur Nusantara Melalui Ketelitian Kurasi &amp; Riset
            </h1>
            <p className="text-[#90a4cb] text-sm sm:text-base leading-relaxed mb-6">
              Nusantara Gemar Membaca (NGM) menghadirkan folklor, epos, dan dongeng kepulauan Indonesia secara kontekstual, bermartabat, dan relevan bagi generasi muda, dengan menghormati asal-usul naskah lisan serta kearifan para penutur adat.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('katalog-cerita')}
                className="bg-[#fd8c6e] hover:bg-[#9d422a] text-[#0e2444] hover:text-white font-bold px-5 py-2.5 rounded-xl transition-all text-xs cursor-pointer shadow-md"
              >
                Mulai Jelajah Naskah
              </button>
              <button
                onClick={onOpenGlossary}
                className="bg-[#263a5b] hover:bg-[#344454] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Kamus Istilah Adat</span>
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[240px]">menu_book</span>
          </div>
        </div>

        {/* 4 Pillars of Curation */}
        <section className="mb-14">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a]">
              Standar Editorial
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0e2444] mt-1">
              Empat Pilar Verifikasi Etnofolklor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#F3EFE7] rounded-2xl border border-[#E7E0D4]">
              <div className="w-10 h-10 rounded-xl bg-[#0e2444] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <h3 className="font-bold text-lg text-[#0e2444] mb-2">
                1. Rujukan Naskah Klasik &amp; Lisan
              </h3>
              <p className="text-xs sm:text-sm text-[#667483] leading-relaxed">
                Setiap kisah merujuk pada dokumentasi terbitan resmi Balai Pustaka, naskah lontara, babad keraton, dan catatan folklor Balai Bahasa Kemendikbudristek untuk menghindari penyederhanaan yang merusak esensi.
              </p>
            </div>

            <div className="p-6 bg-[#F3EFE7] rounded-2xl border border-[#E7E0D4]">
              <div className="w-10 h-10 rounded-xl bg-[#9d422a] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <h3 className="font-bold text-lg text-[#0e2444] mb-2">
                2. Kontekstualisasi Budaya &amp; Adat
              </h3>
              <p className="text-xs sm:text-sm text-[#667483] leading-relaxed">
                Folklor bukan sekadar hiburan melainkan pranata hukum, mitigasi bencana ekologis, dan resolusi konflik purba. Kami menyertakan anotasi istilah daerah agar pembaca memahami latar filsafatnya.
              </p>
            </div>

            <div className="p-6 bg-[#F3EFE7] rounded-2xl border border-[#E7E0D4]">
              <div className="w-10 h-10 rounded-xl bg-[#263a5b] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <h3 className="font-bold text-lg text-[#0e2444] mb-2">
                3. Interpretasi Visual P2 Beretika
              </h3>
              <p className="text-xs sm:text-sm text-[#667483] leading-relaxed">
                Ilustrasi adegan dirancang sebagai jangkar imajinasi visual pembaca muda dengan tetap berpegang pada riset busana adat, artefak candi, dan lanskap geografis asli daerah setempat.
              </p>
            </div>

            <div className="p-6 bg-[#F3EFE7] rounded-2xl border border-[#E7E0D4]">
              <div className="w-10 h-10 rounded-xl bg-[#0e2444] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h3 className="font-bold text-lg text-[#0e2444] mb-2">
                4. Ramah Jenjang Pendidikan
              </h3>
              <p className="text-xs sm:text-sm text-[#667483] leading-relaxed">
                Pengelompokan adegan, durasi membaca yang terukur, serta penanda jenjang usia (SMP dan SMA/Umum) memudahkan guru dan orang tua mengintegrasikan cerita ke dalam kegiatan literasi sekolah.
              </p>
            </div>
          </div>
        </section>

        {/* References & Institutional Partners */}
        <section className="mb-14 p-8 bg-[#FCFAF5] rounded-3xl border border-[#E7E0D4] shadow-xs">
          <h3 className="text-xl font-bold text-[#0e2444] mb-4">
            Sumber &amp; Lembaga Rujukan Naskah
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#344454]">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#9d422a] text-[18px] shrink-0">book</span>
              <div>
                <strong>Balai Pustaka:</strong> Seri Cerita Rakyat Nusantara, Seri Roman Klasik, dan Babad Adat (1920–sekarang).
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#9d422a] text-[18px] shrink-0">menu_book</span>
              <div>
                <strong>Badan Pengembangan dan Pembinaan Bahasa:</strong> Koleksi Sastra Lisan 34 Provinsi Indonesia (Kemendikbudristek).
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#9d422a] text-[18px] shrink-0">history_edu</span>
              <div>
                <strong>Masyarakat Pernaskahan Nusantara (MANASSA):</strong> Transkripsi Manuskrip I La Galigo, Hikayat Hang Tuah, dan Babad Mataram.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#9d422a] text-[18px] shrink-0">groups</span>
              <div>
                <strong>Komunitas Budaya &amp; Tetua Adat:</strong> Verifikasi tradisi tutur lisan Sumatera, Jawa, Kalimantan, Sulawesi, Maluku, dan Papua.
              </div>
            </li>
          </ul>
        </section>

        {/* Community Submission Box */}
        <section className="bg-[#F3EFE7] rounded-3xl p-6 sm:p-10 border border-[#E7E0D4]">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a] block mb-1">
              Partisipasi Publik
            </span>
            <h3 className="text-2xl font-bold text-[#0e2444] mb-2">
              Rekomendasikan Cerita Rakyat dari Daerah Anda
            </h3>
            <p className="text-xs sm:text-sm text-[#667483] mb-6">
              Punya cerita rakyat unik yang belum tercatat? Kirimkan nama kisah dan daerah asal. Tim kurator kami akan menelusuri sumber primer dan rujukan adatnya.
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span>Terima kasih! Rekomendasi naskah telah diterima oleh dewan kurator NGM.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0e2444] mb-1">
                      Nama Pengusul
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda..."
                      value={submissionName}
                      onChange={(e) => setSubmissionName(e.target.value)}
                      className="w-full bg-[#FCFAF5] border border-[#E7E0D4] rounded-xl px-3 py-2 text-xs text-[#0e2444] focus:outline-none focus:border-[#9d422a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0e2444] mb-1">
                      Asal Wilayah / Kabupaten / Suku
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Luwu Timur, Sulawesi Selatan"
                      value={submissionRegion}
                      onChange={(e) => setSubmissionRegion(e.target.value)}
                      className="w-full bg-[#FCFAF5] border border-[#E7E0D4] rounded-xl px-3 py-2 text-xs text-[#0e2444] focus:outline-none focus:border-[#9d422a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0e2444] mb-1">
                    Judul Naskah &amp; Ringkasan Singkat
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ceritakan secara singkat kisah atau nilai moral dari cerita tersebut..."
                    value={submissionStory}
                    onChange={(e) => setSubmissionStory(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-[#E7E0D4] rounded-xl px-3 py-2 text-xs text-[#0e2444] focus:outline-none focus:border-[#9d422a]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#0e2444] hover:bg-[#1D2E49] text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Kirim Usulan Naskah
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
