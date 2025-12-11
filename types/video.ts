export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
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

