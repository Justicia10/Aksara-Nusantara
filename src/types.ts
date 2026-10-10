export type PageId = 'beranda' | 'katalog-cerita' | 'peta-nusantara' | 'tentang-&-sumber' | 'baca-cerita' | 'admin';

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
    id?: string;
    name: string;
    role: string;
    icon: string;
  }>;
  paragraphs: string[];
  culturalAnnotation: CulturalAnnotation;
  /** Provenance of `imageUrl`, provided by the server from the VisualAsset record (never inferred from the URL). */
  visual?: SceneVisual;

  // ---- Interactive 2D (all optional, FR-2D-MODE-04) ----
  mode?: ReaderMode;                 // empty => 'standard'
  backgroundAssetId?: string;        // PixelAsset id (see src/data/interactive/assets.ts)
  backgroundAlt?: string;
  worldWidth?: number;               // logical pixels (OQ34 default: 1 unit = 1 art pixel)
  movementBounds?: { minX: number; maxX: number };
  avatarStartX?: number;
  interactiveTargets?: InteractiveTarget[];
  storyEvents?: StoryEvent[];
  decorSprites?: DecorSprite[];      // non-interactive scenery
  nextSceneNumber?: number;          // empty on the last scene
}

export interface SceneVisual {
  assetId: string;
  generationMethod: 'ai' | 'manual' | 'unknown';
  licenseStatus: string;
}

export interface CulturalAnnotation {
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
}

// ===================== Interactive 2D Story Exploration =====================
export type ReaderMode = 'standard' | 'interactive-2d';
export type Interactive2DStatus = 'not-ready' | 'ready';

export interface PlayerAvatar {
  id: string;
  name: string;
  spriteAssetId: string;
  movement?: { speed?: number };     // logical pixels per second
}

export type InteractiveTargetType = 'character' | 'object' | 'environment';

export interface CulturalContentRef {
  glossaryTerm?: string;             // GlossaryTerm.term
  annotation?: CulturalAnnotation;   // same shape as the scene annotation
}

export interface InteractiveTarget {
  id: string;
  sceneNumber: number;
  type: InteractiveTargetType;
  label: string;                     // accessible name, visible in the proximity hint
  spriteAssetId: string;
  entityRef?: { kind: 'character' | 'glossary-term' | 'cultural-annotation'; key: string };
  positionX: number;                 // horizontal centre, logical px
  interactionRadius: number;         // logical px, per target (OQ31 default)
  hint: string;
  eventId: string;
  culturalContent?: CulturalContentRef;
}

export type StoryEventType = 'narration' | 'dialogue' | 'cultural-info';
export type StoryEventRequirement = 'required' | 'optional';
export type AfterEventAction = 'return-control' | 'advance-scene';

export interface StoryEvent {
  id: string;
  sceneNumber: number;
  triggerTargetId: string;
  type: StoryEventType;
  requirement: StoryEventRequirement;
  sequence?: number;                 // order among required events (OQ41 default: ascending)
  lines?: Array<{ speaker?: string; text: string }>;
  culturalContent?: CulturalContentRef;
  afterEvent: AfterEventAction;
}

/** Decorative sprite: never interactive (FR-2D-TGT-01). */
export interface DecorSprite {
  id: string;
  spriteAssetId: string;
  positionX: number;
  /** vertical offset from the ground line, logical px (default 0) */
  offsetY?: number;
}

export type AssetGenerationMethod = 'hand-coded-procedural' | 'manual-artwork' | 'ai-assisted' | 'unknown';
export type AssetLicenseStatus = 'project-original' | 'licensed' | 'cc-by' | 'public-domain' | 'unknown';
export type AssetReviewStatus = 'pending' | 'approved' | 'rejected';

/** Provenance metadata for a pixel-art asset (FR-2D-AST-02..05). Never inferred from the URL. */
export interface PixelAsset {
  id: string;
  kind: 'background' | 'avatar' | 'character' | 'object' | 'decor';
  url: string;
  width: number;
  height: number;
  alt: string;
  source: string;
  generationMethod: AssetGenerationMethod;
  licenseStatus: AssetLicenseStatus;
  culturalReviewStatus: AssetReviewStatus;
  reviewNote?: string;
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

  // ---- CMS / publication (server-provided) ----
  status?: PublicationStatus;
  keywords?: string[];
  coverVisual?: SceneVisual;
  /** true when the story has no readable scenes yet (catalog shows it, reader explains). */
  metadataOnly?: boolean;

  // ---- Interactive 2D (optional) ----
  defaultReaderMode?: ReaderMode;            // empty => 'standard'
  interactive2DStatus?: Interactive2DStatus; // empty => 'not-ready'
  playerAvatarId?: string;
}

export type PublicationStatus = 'draft' | 'content-review' | 'visual-review' | 'approved' | 'published' | 'archived';

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

/** Payload of GET /api/content (published content only). */
export interface PublicContent {
  stories: Story[];
  regions: Record<string, RegionDetail>;
  glossary: GlossaryTerm[];
  pixelAssets: PixelAsset[];
  avatars: PlayerAvatar[];
  sources: Array<{ id: string; title: string; author: string; publisher: string; publicationYear: number | null; urlOrReference: string; verificationStatus: string }>;
}
