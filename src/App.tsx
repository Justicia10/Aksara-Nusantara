/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { MapPage } from './components/MapPage';
import { ReaderPage } from './components/ReaderPage';
import { AboutPage } from './components/AboutPage';
import { AdminPage } from './components/AdminPage';
import { GlossaryModal } from './components/GlossaryModal';
import { ContentProvider, useContent } from './lib/content';

/** Routes are state-based (as in the prototype) but mirrored in the URL hash so reload/deep links work. */
const PAGE_HASH: Record<PageId, string> = {
  beranda: '', 'katalog-cerita': 'katalog', 'peta-nusantara': 'peta', 'tentang-&-sumber': 'tentang', 'baca-cerita': 'baca', admin: 'admin',
};
function parseHash(): { page: PageId; storyId?: string } {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [seg, id] = h.split('/');
  const page = (Object.keys(PAGE_HASH) as PageId[]).find((k) => PAGE_HASH[k] === seg && seg !== '');
  return page ? { page, storyId: id ? decodeURIComponent(id) : undefined } : { page: 'beranda' };
}

function Shell() {
  const initial = parseHash();
  const { status, error, retry, stories } = useContent();
  const [currentPage, setCurrentPage] = useState<PageId>(initial.page);
  const [currentStoryId, setCurrentStoryId] = useState<string>(initial.storyId ?? '');
  const [selectedMapRegion, setSelectedMapRegion] = useState<string>('sulawesi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);

  const handleNavigate = (page: PageId, storyId?: string) => {
    if (storyId) setCurrentStoryId(storyId);
    setCurrentPage(page);
    const hash = PAGE_HASH[page] ? `#/${PAGE_HASH[page]}${page === 'baca-cerita' && (storyId ?? currentStoryId) ? '/' + encodeURIComponent(storyId ?? currentStoryId) : ''}` : '#/';
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  React.useEffect(() => {
    const onPop = () => { const p = parseHash(); setCurrentPage(p.page); if (p.storyId) setCurrentStoryId(p.storyId); };
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onPop); };
  }, []);

  const handleSelectRegionFromHome = (regionKey: string) => {
    setSelectedMapRegion(regionKey);
    handleNavigate('peta-nusantara');
  };
  const openGlossary = () => { setSelectedGlossaryTerm(null); setIsGlossaryOpen(true); };
  const handleOpenGlossaryWord = (term: string) => { setSelectedGlossaryTerm(term); setIsGlossaryOpen(true); };

  const needsContent = currentPage !== 'admin' && currentPage !== 'tentang-&-sumber';
  const body = needsContent && status === 'loading' && stories.length === 0 ? (
    <div className="min-h-[60vh] pt-40 text-center text-[#667483]" role="status" data-testid="content-loading">Memuat konten…</div>
  ) : needsContent && status === 'error' && stories.length === 0 ? (
    <div className="min-h-[60vh] pt-40 px-6 text-center" role="alert" data-testid="content-error">
      <h1 className="text-xl font-extrabold text-[#0e2444] mb-2">Konten belum dapat dimuat</h1>
      <p className="text-[#667483] mb-5 text-sm">{error}</p>
      <button onClick={retry} className="bg-[#0e2444] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer" data-testid="retry">Coba lagi</button>
    </div>
  ) : (
    <>
      {currentPage === 'beranda' && <HomePage onNavigate={handleNavigate} onSelectRegion={handleSelectRegionFromHome} onOpenGlossary={openGlossary} />}
      {currentPage === 'katalog-cerita' && <CatalogPage onNavigate={handleNavigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} onOpenGlossary={openGlossary} />}
      {currentPage === 'peta-nusantara' && <MapPage onNavigate={handleNavigate} initialRegion={selectedMapRegion} onOpenGlossary={openGlossary} />}
      {currentPage === 'baca-cerita' && (
        <ReaderPage storyId={currentStoryId} onNavigate={handleNavigate} onOpenGlossaryWord={handleOpenGlossaryWord} onOpenGlossary={openGlossary} isGlossaryOpen={isGlossaryOpen} />
      )}
      {currentPage === 'tentang-&-sumber' && <AboutPage onNavigate={handleNavigate} onOpenGlossary={openGlossary} />}
      {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF5] font-sans antialiased text-[#131c26] selection:bg-[#F5DED6] selection:text-[#9d422a]">
      <Header currentPage={currentPage} onNavigate={handleNavigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} onOpenGlossary={openGlossary} />
      <main className="flex-1">{body}</main>
      <Footer onNavigate={handleNavigate} onOpenGlossary={openGlossary} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} selectedInitialTerm={selectedGlossaryTerm} />
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <Shell />
    </ContentProvider>
  );
}
