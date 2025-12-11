'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SkyboxVRSceneProps {
  onThumbnailClick?: () => void;
}

export default function SkyboxVRScene({ onThumbnailClick }: SkyboxVRSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [aframeLoaded, setAframeLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadAFrame = () => {
      if ((window as any).AFRAME) {
        setAframeLoaded(true);
        return;
      }

      if (document.querySelector('script[src*="aframe"]')) {
        const checkAFrame = setInterval(() => {
          if ((window as any).AFRAME) {
            setAframeLoaded(true);
            clearInterval(checkAFrame);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      script.async = true;
      script.onload = () => {
        setAframeLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadAFrame();
  }, []);

  useEffect(() => {
    if (!aframeLoaded || !sceneRef.current) return;

    const scene = sceneRef.current.querySelector('a-scene') as any;
    if (!scene) return;

    const handleSceneLoaded = () => {
      const checkAssets = setInterval(() => {
        const assets = scene.querySelector('a-assets');
        if (!assets) return;

        const glb = assets.querySelector('#skybox-glb');
        const img = assets.querySelector('#thumbnail-img');

        if (glb && img) {
          const glbEl = glb as any;
          const imgEl = img as any;

          if (
            glbEl.hasLoaded !== false &&
            imgEl.complete &&
            imgEl.naturalWidth > 0
          ) {
            setAssetsLoaded(true);
            clearInterval(checkAssets);
          }
        }
      }, 100);
    };

    scene.addEventListener('loaded', handleSceneLoaded);

    const thumbnailPlane = scene.querySelector('#thumbnail-plane') as any;
    if (thumbnailPlane && onThumbnailClick) {
      const handleClick = () => {
        onThumbnailClick();
      };
      thumbnailPlane.addEventListener('click', handleClick);
      thumbnailPlane.addEventListener('fusing', handleClick);

      return () => {
        thumbnailPlane.removeEventListener('click', handleClick);
        thumbnailPlane.removeEventListener('fusing', handleClick);
      };
    }

    return () => {
      scene.removeEventListener('loaded', handleSceneLoaded);
    };
  }, [aframeLoaded, onThumbnailClick]);

  if (!aframeLoaded) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '18px',
        }}
      >
        Chargement d'A-Frame...
      </div>
    );
  }

  return (
    <div ref={sceneRef} style={{ width: '100%', height: '100vh' }}>
      <a-scene
        vr-mode-ui="enabled: true"
        embedded
        style={{ display: assetsLoaded ? 'block' : 'none' }}
      >
        <a-assets>
          <a-asset-item id="skybox-glb" src="/models/skybox.glb" />
          <img id="thumbnail-img" src="/thumbnails/video1.jpg" crossOrigin="anonymous" />
        </a-assets>

        <a-entity
          id="skybox"
          gltf-model="#skybox-glb"
          scale="100 100 100"
          position="0 0 0"
        />

        <a-light type="ambient" color="#ffffff" intensity="0.4" />

        <a-light
          type="directional"
          position="0 5 0"
          color="#ffffff"
          intensity="0.8"
          cast-shadow="true"
        />

        <a-camera
          id="camera"
          position="0 1.6 0"
          wasd-controls="enabled: false"
          look-controls="enabled: true"
        >
          <a-cursor
            id="cursor"
            fuse="true"
            fuse-timeout="500"
            raycaster="objects: .clickable"
            animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.8 0.8 0.8; dur: 500"
            animation__mouseleave="property: scale; startEvents: mouseleave; from: 0.8 0.8 0.8; to: 1 1 1; dur: 500"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: #4CC3D9; shader: flat"
          />
        </a-camera>

        <a-plane
          id="thumbnail-plane"
          class="clickable"
          src="#thumbnail-img"
          width="1.5"
          height="0.9"
          position="0 1.6 -3"
          animation__float="property: position; to: 0 1.7 -3; dur: 2000; easing: easeInOutSine; loop: true; dir: alternate"
        />
      </a-scene>

      {!assetsLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '18px',
            zIndex: 1000,
          }}
        >
          Chargement des assets...
        </div>
      )}
    </div>
  );
}

