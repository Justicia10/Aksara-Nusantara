import React, { useState, useEffect } from 'react';
import { PageId, Story, Scene } from '../types';
import { STORIES } from '../data/stories';

interface ReaderPageProps {
  storyId?: string;
  onNavigate: (page: PageId, storyId?: string) => void;
  onOpenGlossaryWord?: (term: string) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  storyId = 'roro-jonggrang',
  onNavigate,
  onOpenGlossaryWord
}) => {
  const story: Story = STORIES.find((s) => s.id === storyId) || STORIES[0];
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(2); // default to Scene 3 (Klimaks Pertaruhan)
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // -1, 0, 1, 2
  const [isQuietMode, setIsQuietMode] = useState<boolean>(false);
  const [activeAnnotationTooltip, setActiveAnnotationTooltip] = useState<string | null>(null);

  // Fallback if story doesn't have scenes populated
  const scenes: Scene[] = story.scenes && story.scenes.length > 0
    ? story.scenes
    : STORIES[0].scenes;

  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSceneIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes.length]);

  const fontClasses = [
    'text-[15px] leading-[1.7]', // -1
    'text-[17px] leading-[1.8]', // 0
    'text-[19px] leading-[1.85]', // 1
    'text-[21px] leading-[1.9]', // 2
  ][fontSizeOffset + 1] || 'text-[17px] leading-[1.8]';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 pt-20 ${
        isQuietMode ? 'bg-[#181614] text-[#E8E2D5]' : 'bg-[#FCFAF5] text-[#131c26]'
      }`}
    >
      {/* Sticky Reader Sub-Navigation Bar */}
      <div
        className={`sticky top-20 z-40 border-b backdrop-blur-md transition-colors ${
          isQuietMode
            ? 'bg-[#181614]/90 border-[#302b25]'
            : 'bg-[#FCFAF5]/90 border-[#E7E0D4]'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Back button */}
          <button
            onClick={() => onNavigate('katalog-cerita')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isQuietMode
                ? 'text-[#C5BCAB] hover:text-white hover:bg-[#25221d]'
                : 'text-[#667483] hover:text-[#0e2444] hover:bg-[#F3EFE7]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Kembali ke Katalog</span>
          </button>

          {/* Center: Title & Progress Dots */}
          <div className="flex flex-col items-center">
            <span
              className={`text-xs font-bold truncate max-w-[200px] sm:max-w-xs ${
                isQuietMode ? 'text-white' : 'text-[#0e2444]'
              }`}
            >
              {story.title}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {scenes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSceneIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSceneIndex === idx
                      ? isQuietMode
                        ? 'w-5 bg-[#fd8c6e]'
                        : 'w-5 bg-[#9d422a]'
                      : isQuietMode
                      ? 'w-1.5 bg-[#403930]'
                      : 'w-1.5 bg-[#E7E0D4]'
                  }`}
                  title={`Ke Adegan ${idx + 1}`}
                />
              ))}
              <span
                className={`text-[10px] ml-1.5 font-medium ${
                  isQuietMode ? 'text-[#908677]' : 'text-[#667483]'
                }`}
              >
                Adegan {currentSceneIndex + 1} dari {scenes.length}
              </span>
            </div>
          </div>

          {/* Right: Font scaler & Quiet Mode */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center rounded-lg p-0.5 border ${
                isQuietMode
                  ? 'bg-[#25221d] border-[#383228]'
                  : 'bg-[#F3EFE7] border-[#E7E0D4]'
              }`}
            >
              <button
                onClick={() => setFontSizeOffset((prev) => Math.max(-1, prev - 1))}
                className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                  fontSizeOffset === -1 ? 'opacity-40' : ''
                }`}
                title="Perkecil Teks"
              >
                A-
              </button>
              <span className="text-[10px] px-1 font-mono">
                {fontSizeOffset === 0 ? '100%' : fontSizeOffset > 0 ? '+20%' : '-15%'}
              </span>
              <button
                onClick={() => setFontSizeOffset((prev) => Math.min(2, prev + 1))}
                className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                  fontSizeOffset === 2 ? 'opacity-40' : ''
                }`}
                title="Perbesar Teks"
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setIsQuietMode(!isQuietMode)}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                isQuietMode
                  ? 'bg-[#302b25] text-[#fd8c6e] border-[#453e34]'
                  : 'bg-[#F3EFE7] text-[#0e2444] border-[#E7E0D4] hover:bg-[#E7E0D4]'
              }`}
              title="Mode Hening Membaca"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isQuietMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden md:inline">
                {isQuietMode ? 'Terang' : 'Hening'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Cinematic Visual Banner (16:9) */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl mb-6 bg-black">
          <img
            src={currentScene.imageUrl}
            alt={currentScene.imageAlt}
            className="w-full aspect-16/9 object-cover"
          />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#fd8c6e]">auto_awesome</span>
              <span>Interpretasi Visual AI • Kurasi NGM</span>
            </span>

            <span className="bg-[#9d422a] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              {currentScene.partTitle} • {currentScene.timeContext}
            </span>
          </div>

          {/* Bottom subtle gradient */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>

        {/* Scene Image Caption */}
        <div
          className={`text-center text-xs mb-8 italic ${
            isQuietMode ? 'text-[#8c8273]' : 'text-[#667483]'
          }`}
        >
          {currentScene.imageAlt}
        </div>

        {/* Scene Header */}
        <header className="mb-8 pb-6 border-b border-[#E7E0D4]/60">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9d422a]">
              {currentScene.actTitle}
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 ${
              isQuietMode ? 'text-white' : 'text-[#0e2444]'
            }`}
          >
            {currentScene.actSubtitle}
          </h1>

          {/* Characters in Scene */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span
              className={`text-xs font-medium mr-1 ${
                isQuietMode ? 'text-[#a19685]' : 'text-[#667483]'
              }`}
            >
              Tokoh dalam adegan ini:
            </span>
            {currentScene.characters.map((char, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isQuietMode
                    ? 'bg-[#28231d] text-[#e0d6c4] border border-[#383127]'
                    : 'bg-[#F3EFE7] text-[#0e2444] border border-[#E7E0D4]'
                }`}
              >
                <span>{char.icon}</span>
                <span>{char.name}</span>
                <span className="opacity-60 text-[10px]">({char.role})</span>
              </span>
            ))}
          </div>
        </header>

        {/* Narrative Paragraphs */}
        <article className="mb-10 space-y-6">
          {currentScene.paragraphs.map((para, idx) => {
            if (idx === 0) {
              // Paragraph with Drop Cap
              const firstLetter = para.charAt(0);
              const remainingText = para.slice(1);

              return (
                <p
                  key={idx}
                  className={`${fontClasses} font-normal tracking-normal text-justify sm:text-left`}
                >
                  <span
                    className={`float-left text-5xl sm:text-6xl font-extrabold font-serif leading-[0.8] pr-2.5 pt-1 ${
                      isQuietMode ? 'text-[#fd8c6e]' : 'text-[#0e2444]'
                    }`}
                  >
                    {firstLetter}
                  </span>
                  {/* Highlight interactive words */}
                  {remainingText.includes('lesung') ? (
                    <>
                      {remainingText.split('lesung')[0]}
                      <button
                        onClick={() => {
                          if (onOpenGlossaryWord) onOpenGlossaryWord('Gejog Lesung');
                          setActiveAnnotationTooltip('Gejog Lesung');
                        }}
                        className="underline decoration-[#9d422a] decoration-2 underline-offset-4 text-[#9d422a] font-semibold hover:bg-[#F5DED6]/50 rounded px-0.5 cursor-pointer"
                        title="Klik untuk melihat arti istilah adat"
                      >
                        lesung
                      </button>
                      {remainingText.split('lesung')[1]}
                    </>
                  ) : (
                    remainingText
                  )}
                </p>
              );
            }

            return (
              <p
                key={idx}
                className={`${fontClasses} font-normal tracking-normal text-justify sm:text-left`}
              >
                {para}
              </p>
            );
          })}
        </article>

        {/* CULTURAL ANNOTATION BOX */}
        {currentScene.culturalAnnotation && (
          <div
            className={`rounded-2xl p-5 sm:p-6 border mb-10 transition-colors ${
              isQuietMode
                ? 'bg-[#221e1a] border-[#383128]'
                : 'bg-[#F5DED6]/70 border-[#fd8c6e]/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#9d422a] text-[22px] shrink-0 mt-0.5">
                auto_stories
              </span>
              <div className="space-y-2">
                <h4
                  className={`text-sm font-bold ${
                    isQuietMode ? 'text-[#fd8c6e]' : 'text-[#74240e]'
                  }`}
                >
                  {currentScene.culturalAnnotation.title}
                </h4>
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isQuietMode ? 'text-[#c7bdad]' : 'text-[#74240e]'
                  }`}
                >
                  {currentScene.culturalAnnotation.description}
                </p>
                <div
                  className={`text-[11px] pt-1 font-medium ${
                    isQuietMode ? 'text-[#8f8371]' : 'text-[#9d422a]'
                  }`}
                >
                  📖 <em>{currentScene.culturalAnnotation.source}</em>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reader Navigation Footer */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t ${
            isQuietMode ? 'border-[#302b25]' : 'border-[#E7E0D4]'
          }`}
        >
          <button
            onClick={() => setCurrentSceneIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentSceneIndex === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSceneIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : isQuietMode
                ? 'bg-[#28231d] text-[#e0d6c4] hover:bg-[#342e26]'
                : 'bg-[#F3EFE7] text-[#0e2444] hover:bg-[#E7E0D4]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Adegan Sebelumnya</span>
          </button>

          {/* Next Scene Button */}
          {currentSceneIndex < scenes.length - 1 ? (
            <button
              onClick={() => setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1))}
              className="bg-[#9d422a] hover:bg-[#b54f35] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Lanjut ke Adegan {currentSceneIndex + 2}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('katalog-cerita')}
              className="bg-[#0e2444] hover:bg-[#1D2E49] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Selesai Membaca • Ke Katalog</span>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        <div
          className={`text-center text-[11px] mt-6 ${
            isQuietMode ? 'text-[#6e6456]' : 'text-[#667483]'
          }`}
        >
          Gunakan tombol panah <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px]">[←]</kbd> dan <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px]">[→]</kbd> pada papan ketik untuk berpindah adegan dengan cepat.
        </div>
      </main>
    </div>
  );
};
