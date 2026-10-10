import { PlayerAvatar } from '../../types';

/**
 * Guide avatars. The avatar is NOT a story Character (FR-CHAR-06): it is never presented as a folklore
 * figure or as a source of cultural facts. Speed in logical px/s (OQ30 default, tunable per avatar).
 */
export const PLAYER_AVATARS: PlayerAvatar[] = [
  { id: 'pemandu-nusa', name: 'Pemandu Nusa', spriteAssetId: 'avatar-pemandu', movement: { speed: 70 } },
];

export const DEFAULT_AVATAR_SPEED = 70;
export const getAvatar = (id?: string): PlayerAvatar | undefined => PLAYER_AVATARS.find((a) => a.id === id);
