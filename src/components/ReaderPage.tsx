import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageId, Story, Scene } from '../types';
import { useContent } from '../lib/content';
import { SafeImage } from './SafeImage';
import { Interactive2DReader, FallbackReason } from './Interactive2DReader';
import { validateStory2D } from '../engine2d/validate';
import { getAvatar } from '../data/interactive/avatars';
import { track } from '../lib/api';

interface ReaderPageProps {
  storyId?: string;
  onNavigate: (page: PageId, storyId?: string) => void;
  onOpenGlossaryWord?: (term: string) => void;
  onOpenGlossary?: () => void;
  isGlossaryOpen?: boolean;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  storyId,
  onNavigate,
  onOpenGlossaryWord,
  onOpenGlossary,
  isGlossaryOpen = false
}) => {
  const { stories, pixelAssets, avatars, glossary, status, retry } = useContent();
  const story: Story | undefined = stories.find((s) => s.id === storyId);
  const scenes: Scene[] = story?.scenes ?? [];

  // FR-READ-01: always start at the first scene
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // -1, 0, 1, 2
  const [isQuietMode, setIsQuietMode] = useState<boolean>(false);
  const [activeAnnotationTooltip, setActiveAnnotationTooltip] = useState<string | null>(null);
  const [forcedStandard, setForcedStandard] = useState<boolean>(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [finished, setFinished] = useState<boolean>(false);

  // reset reader state when another story is opened
  useEffect(() => {
    setCurrentSceneIndex(0);
    setForcedStandard(false);
    setFallbackNotice(null);
    setFinished(false);
    if (storyId) track('story_open', { storyId });
  }, [storyId]);

  // FR-2D-MODE-01/02: 2D only if flagged ready AND the configuration validates against the shipped assets
  const avatar = useMemo(() => avatars.find((a) => a.id === story?.playerAvatarId) ?? getAvatar(story?.playerAvatarId), [avatars, story]);
  const is2DCapable = useMemo(() => {
    if (!story || !avatar) return false;
    if (story.interactive2DStatus !== 'ready' || story.defaultReaderMode !== 'interactive-2d') return false;
    return validateStory2D(story, { assets: pixelAssets, avatars: avatar ? [avatar] : [], glossary }).ok;
  }, [story, avatar, pixelAssets, glossary]);
  const use2D = is2DCapable && !forcedStandard;

  const handleFallback = useCallback((reason: FallbackReason, sceneNumber: number) => {
    setCurrentSceneIndex(Math.max(0, sceneNumber - 1));
    setForcedStandard(true);
    setFallbackNotice('Mode jelajah 2D tidak dapat dimuat (aset gagal dimuat). Kamu melanjutkan di pembaca standar; teks cerita tetap lengkap.');
    track('2d_fallback', { storyId: story?.id, sceneNumber, props: { reason } });
  }, [story?.id]);
  const handleSwitchToStandard = useCallback((sceneNumber: number) => {
    setCurrentSceneIndex(Math.max(0, sceneNumber - 1));
    setForcedStandard(true);
  }, []);
  const handleSceneChange = useCallback((n: number) => setCurrentSceneIndex(n - 1), []);

  const currentScene = scenes[Math.min(currentSceneIndex, Math.max(0, scenes.length - 1))];

  // Standard-reader keyboard navigation. Disabled in 2D mode (arrows move the avatar, FR-2D-CTRL-02),
  // while typing in a field, or while the glossary is open.
  useEffect(() => {
    if (use2D || scenes.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)) return;
      if (isGlossaryOpen) return;
      if (e.key === 'ArrowLeft') {
        setCurrentSceneIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes.length, use2D, isGlossaryOpen]);

  if (status === 'loading' && !story) {
    return <div className="min-h-screen pt-32 text-center text-[#667483]" role="status">Memuat cerita…</div>;
  }
  if (!story) {
    return (
      <div className="min-h-screen pt-32 px-6 text-center" data-testid="story-not-found">
        <h1 className="text-2xl font-extrabold text-[#0e2444] mb-2">Cerita tidak ditemukan</h1>
        <p className="text-[#667483] mb-6">Cerita ini belum tersedia untuk publik atau tautannya keliru.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => onNavigate('katalog-cerita')} className="bg-[#0e2444] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">Ke Katalog</button>
          {status === 'error' && <button onClick={retry} className="border border-[#E7E0D4] text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">Coba lagi</button>}
        </div>
      </div>
    );
  }
  if (scenes.length === 0 || !currentScene) {
    // Story exists in the catalogue but has no readable scenes yet: say so, never show another story's scenes.
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6" data-testid="story-no-scenes">
        <div className="max-w-2xl mx-auto bg-[#F3EFE7] border border-[#E7E0D4] rounded-3xl p-8">
          <div className="text-xs font-bold uppercase tracking-widest text-[#9d422a] mb-2">{story.region} • {story.category}</div>
          <h1 className="text-3xl font-extrabold text-[#0e2444] mb-3">{story.title}</h1>
          <p className="text-[#344454] mb-6 leading-relaxed">{story.summary}</p>
          <div className="bg-white border border-[#E7E0D4] rounded-xl p-4 text-sm text-[#344454] mb-6">
            <strong>Naskah adegan untuk cerita ini belum tersedia.</strong> Tim kurator sedang menyiapkannya bersama sumber yang dapat ditelusuri.
          </div>
          <button onClick={() => onNavigate('katalog-cerita')} className="bg-[#0e2444] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">Kembali ke Katalog</button>
        </div>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
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

          {/* Center: Title & Progress Dots (hidden on phones to keep the bar inside the viewport) */}
          <div className="hidden sm:flex flex-col items-center min-w-0">
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
                  onClick={() => { if (!use2D) setCurrentSceneIndex(idx); }}
                  disabled={use2D}
                  className={`h-1.5 rounded-full transition-all ${use2D ? 'cursor-default' : 'cursor-pointer'} ${
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
          <div className="flex items-center gap-1 sm:gap-2">
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

      {fallbackNotice && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
          <div role="alert" data-testid="fallback-notice" className="bg-[#fff4d6] text-[#513400] border border-[#f9bb62] rounded-xl px-4 py-3 text-sm font-medium flex items-start justify-between gap-3">
            <span>{fallbackNotice}</span>
            <button onClick={() => setFallbackNotice(null)} className="underline text-xs cursor-pointer shrink-0">Tutup</button>
          </div>
        </div>
      )}

      {is2DCapable && !use2D && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
          <button onClick={() => { setForcedStandard(false); setFallbackNotice(null); }} data-testid="switch-2d" className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#E7E0D4] bg-[#F3EFE7] text-[#0e2444] hover:bg-[#E7E0D4] cursor-pointer inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">sports_esports</span> Coba mode jelajah 2D
          </button>
        </div>
      )}

      {use2D && avatar ? (
        <main className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
          <div className="bg-[#FCFAF5] text-[#131c26] rounded-3xl p-3 sm:p-6">
          <Interactive2DReader
            story={story}
            avatar={avatar}
            assets={pixelAssets}
            startSceneIndex={currentSceneIndex}
            inputBlocked={isGlossaryOpen}
            fontClass={fontClasses}
            onSceneChange={handleSceneChange}
            onFallback={handleFallback}
            onSwitchToStandard={handleSwitchToStandard}
            onNavigate={onNavigate}
            onOpenGlossaryWord={(t) => onOpenGlossaryWord?.(t)}
            onOpenGlossary={() => onOpenGlossary?.()}
          />
          </div>
        </main>
      ) : (
      /* Main Reading Canvas */
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Cinematic Visual Banner (16:9) */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl mb-6 bg-black">
          <SafeImage
            src={currentScene.imageUrl}
            alt={currentScene.imageAlt}
            fallbackLabel="Visual adegan belum tersedia — teks cerita tetap dapat dibaca"
            className="w-full aspect-16/9 object-cover"
          />

          {/* Top badges: the AI label is shown only when the asset record says it is AI-generated (FR-AI-06) */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {currentScene.imageUrl && (
              <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#fd8c6e]">{currentScene.visual?.generationMethod === 'ai' ? 'auto_awesome' : 'image'}</span>
                <span data-testid="visual-badge">
                  {currentScene.visual?.generationMethod === 'ai'
                    ? 'Interpretasi Visual AI • Kurasi NGM'
                    : 'Ilustrasi • asal-usul visual sedang diverifikasi'}
                </span>
              </span>
            )}

            <span className="bg-[#9d422a] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm ml-auto">
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

          {/* Characters in Scene (hidden when the scene has none) */}
          {currentScene.characters.length > 0 && (
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
          )}
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
        {currentScene.culturalAnnotation && currentScene.culturalAnnotation.title && currentScene.culturalAnnotation.source && (
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
              onClick={() => { setFinished(true); track('story_complete', { storyId: story.id }); }}
              data-testid="finish-reading"
              className="bg-[#0e2444] hover:bg-[#1D2E49] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Selesai Membaca</span>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          )}
        </div>

        {finished && (
          <div className="mt-8 rounded-2xl border border-[#E7E0D4] bg-[#F3EFE7] p-6" data-testid="completion-standard">
            <div className="flex items-center gap-2 text-[#0e2444] font-extrabold text-lg mb-1"><span className="material-symbols-outlined text-[#9d422a]">check_circle</span> Cerita selesai</div>
            <p className="text-sm text-[#344454] mb-4">Kamu telah membaca “{story.title}” sampai akhir. Lanjutkan menjelajah:</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onNavigate('peta-nusantara')} className="bg-[#0e2444] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Jelajahi Peta</button>
              <button onClick={() => onOpenGlossary?.()} className="bg-[#9d422a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Buka Glosarium</button>
              <button onClick={() => onNavigate('katalog-cerita')} className="bg-white border border-[#E7E0D4] text-[#0e2444] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Katalog Cerita</button>
              {is2DCapable && <button onClick={() => { setForcedStandard(false); setCurrentSceneIndex(0); setFinished(false); }} className="bg-white border border-[#E7E0D4] text-[#0e2444] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Coba mode jelajah 2D</button>}
            </div>
          </div>
        )}

        {/* Keyboard hint */}
        <div
          className={`text-center text-[11px] mt-6 ${
            isQuietMode ? 'text-[#6e6456]' : 'text-[#667483]'
          }`}
        >
          Gunakan tombol panah <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px]">[←]</kbd> dan <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px]">[→]</kbd> pada papan ketik untuk berpindah adegan dengan cepat.
        </div>
      </main>
      )}
    </div>
  );
};
