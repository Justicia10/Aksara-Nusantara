import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GlossaryTerm, PixelAsset, PlayerAvatar, PublicContent, RegionDetail, Story } from '../types';
import { fetchContent } from './api';

type Status = 'loading' | 'ready' | 'error';
interface Ctx {
  status: Status;
  error: string | null;
  retry: () => void;
  stories: Story[];
  regions: Record<string, RegionDetail>;
  glossary: GlossaryTerm[];
  pixelAssets: PixelAsset[];
  avatars: PlayerAvatar[];
  sources: PublicContent['sources'];
}

const EMPTY: PublicContent = { stories: [], regions: {}, glossary: [], pixelAssets: [], avatars: [], sources: [] };
const ContentContext = createContext<Ctx | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode; initial?: PublicContent }> = ({ children, initial }) => {
  const [content, setContent] = useState<PublicContent>(initial ?? EMPTY);
  const [status, setStatus] = useState<Status>(initial ? 'ready' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initial) return;
    const ac = new AbortController();
    setStatus('loading');
    fetchContent(ac.signal)
      .then((c) => { setContent(c); setError(null); setStatus('ready'); })
      .catch((e) => { if (ac.signal.aborted) return; setError(e.message); setStatus('error'); });
    return () => ac.abort();
  }, [attempt, initial]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const value = useMemo<Ctx>(() => ({ status, error, retry, ...content }), [status, error, retry, content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export function useContent(): Ctx {
  const c = useContext(ContentContext);
  if (!c) throw new Error('useContent must be used inside <ContentProvider>');
  return c;
}

/** Number of published stories in a region; supports the catalog's grouped keys. */
export function countByRegion(stories: Story[], key: string): number {
  if (key === 'all') return stories.length;
  if (key === 'bali-nusa') return stories.filter((s) => s.regionKey === 'balinusra').length;
  if (key === 'maluku-papua') return stories.filter((s) => ['maluku', 'papua'].includes(s.regionKey)).length;
  return stories.filter((s) => s.regionKey === key).length;
}
