export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;

  // --- VR ONLY ---
  positionX?: number;
  positionY?: number;
  positionZ?: number;

  rotationY?: number;

  width?: number;
  height?: number;

  // Optionnel si tu veux lancer une vidéo plus tard
  videoUrl?: string;
}

export interface ChannelItem {
  id: string;
  label: string;
  icon: string;
}

export interface FavoriteItem extends VideoItem {
  addedAt: string;
}

export interface HistoryItem extends VideoItem {
  watchedAt: string;
}

