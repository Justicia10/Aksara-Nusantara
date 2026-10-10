import { STORIES } from '../src/data/stories';
import { applyRoroJonggrang2D } from '../src/data/interactive/roro-jonggrang';
import { PIXEL_ASSETS } from '../src/data/interactive/assets';
import { PLAYER_AVATARS } from '../src/data/interactive/avatars';
import { GLOSSARY_TERMS } from '../src/data/glossary';
import { Story } from '../src/types';

export const roro2D = (): Story => structuredClone(applyRoroJonggrang2D(STORIES.find((s) => s.id === 'roro-jonggrang')!));
export const ctx = () => ({ assets: structuredClone(PIXEL_ASSETS), avatars: PLAYER_AVATARS, glossary: GLOSSARY_TERMS });
