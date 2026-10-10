export type PageId = 'beranda' | 'katalog-cerita' | 'peta-nusantara' | 'tentang-&-sumber' | 'baca-cerita';

export type RegionKey = 'all' | 'sumatera' | 'jawa' | 'kalimantan' | 'sulawesi' | 'bali-nusa' | 'maluku-papua' | 'balinusra' | 'maluku' | 'papua';

export type StoryTheme = 'all' | 'kepahlawanan' | 'kebijaksanaan' | 'asal-usul' | 'kesetiaan' | 'satwa' | 'epos' | 'moral' | 'arsitektur' | 'alam';

export type TargetReader = 'all' | 'smp' | 'sma';

export interface Scene {
  sceneNumber: number;
  totalScenes: number;
  partTitle: string;
  timeContext: string;
  actTitle: string;
  actSubtitle: string;
  imageUrl: string;
  imageAlt: string;
  characters: Array<{
    name: string;
    role: string;
    icon: string;
  }>;
  paragraphs: string[];
  culturalAnnotation: {
    title: string;
    description: string;
    source: string;
    sourceUrl?: string;
  };
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  region: string;
  regionKey: RegionKey;
  locationDetail: string;
  category: string;
  theme: StoryTheme;
  themeLabel: string;
  readingTimeMinutes: number;
  sceneCount: number;
  targetReader: 'smp' | 'sma' | 'all';
  summary: string;
  imageUrl: string;
  imageAlt: string;
  culturalTag?: string;
  rating?: number;
  reviewCount?: number;
  tradition: string;
  verifiedSource: string;
  scenes: Scene[];
}

export interface RegionDetail {
  key: string;
  name: string;
  title: string;
  provinces: string;
  badge: string;
  code: string;
  storyCount: number;
  sub: string;
  summary: string;
  culturalHighlights: Array<{
    title: string;
    description: string;
  }>;
  featuredStoryIds: string[];
}

export interface GlossaryTerm {
  term: string;
  region: string;
  meaning: string;
  culturalContext: string;
}
