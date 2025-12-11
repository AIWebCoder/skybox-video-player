'use client';

import dynamic from 'next/dynamic';
import { VideoItem } from '@/types/video';

const VRSkyboxMenu = dynamic(() => import('@/components/VRSkyboxMenu'), {
  ssr: false,
});

export default function VRPage() {
  const handleSelectVideo = (index: number, video: VideoItem) => {
    console.log('Video sélectionné:', index, video);
  };

  const handleSelectChannel = (channelId: string) => {
    console.log('Channel sélectionné:', channelId);
  };

  return (
    <main style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <VRSkyboxMenu
        onSelectVideo={handleSelectVideo}
        onSelectChannel={handleSelectChannel}
      />
    </main>
  );
}

