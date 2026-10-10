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
import { GlossaryModal } from './components/GlossaryModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('beranda');
  const [currentStoryId, setCurrentStoryId] = useState<string>('roro-jonggrang');
  const [selectedMapRegion, setSelectedMapRegion] = useState<string>('sulawesi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);

  const handleNavigate = (page: PageId, storyId?: string) => {
    if (storyId) {
      setCurrentStoryId(storyId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRegionFromHome = (regionKey: string) => {
    setSelectedMapRegion(regionKey);
    setCurrentPage('peta-nusantara');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGlossaryWord = (term: string) => {
    setSelectedGlossaryTerm(term);
    setIsGlossaryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF5] font-sans antialiased text-[#131c26] selection:bg-[#F5DED6] selection:text-[#9d422a]">
      {/* Main Header Navigation */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenGlossary={() => {
          setSelectedGlossaryTerm(null);
          setIsGlossaryOpen(true);
        }}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'beranda' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectRegion={handleSelectRegionFromHome}
            onOpenGlossary={() => {
              setSelectedGlossaryTerm(null);
              setIsGlossaryOpen(true);
            }}
          />
        )}

        {currentPage === 'katalog-cerita' && (
          <CatalogPage
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenGlossary={() => {
              setSelectedGlossaryTerm(null);
              setIsGlossaryOpen(true);
            }}
          />
        )}

        {currentPage === 'peta-nusantara' && (
          <MapPage
            onNavigate={handleNavigate}
            initialRegion={selectedMapRegion}
            onOpenGlossary={() => {
              setSelectedGlossaryTerm(null);
              setIsGlossaryOpen(true);
            }}
          />
        )}

        {currentPage === 'baca-cerita' && (
          <ReaderPage
            storyId={currentStoryId}
            onNavigate={handleNavigate}
            onOpenGlossaryWord={handleOpenGlossaryWord}
          />
        )}

        {currentPage === 'tentang-&-sumber' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenGlossary={() => {
              setSelectedGlossaryTerm(null);
              setIsGlossaryOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenGlossary={() => {
          setSelectedGlossaryTerm(null);
          setIsGlossaryOpen(true);
        }}
      />

      {/* Cultural Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        selectedInitialTerm={selectedGlossaryTerm}
      />
    </div>
  );
}
