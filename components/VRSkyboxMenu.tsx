// src/components/VRSkyboxMenu.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { channels, videos, favorites, history } from "@/data/videos";
import { VideoItem } from "@/types/video";

interface VRSkyboxMenuProps {
  onSelectVideo?: (index: number, video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
}

export default function VRSkyboxMenu({
  onSelectVideo,
  onSelectChannel,
}: VRSkyboxMenuProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("home");
  const [activeTab, setActiveTab] = useState<"favorites" | "history">(
    "favorites"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

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

      const script = document.createElement("script");
      script.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
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

    const scene = sceneRef.current.querySelector("a-scene") as any;
    if (!scene) return;

    const handleSceneLoaded = () => {
      const checkAssets = setInterval(() => {
        const assets = scene.querySelector("a-assets");
        if (!assets) return;

        const glb = assets.querySelector("#skybox-glb");
        const images = assets.querySelectorAll("img");

        let allLoaded = true;
        if (glb) {
          const glbEl = glb as any;
          if (glbEl.hasLoaded === false) allLoaded = false;
        }

        images.forEach((img: any) => {
          if (!img.complete || img.naturalWidth === 0) allLoaded = false;
        });

        if (allLoaded && images.length > 0) {
          setAssetsLoaded(true);
          clearInterval(checkAssets);
        }
      }, 100);
    };

    scene.addEventListener("loaded", handleSceneLoaded);

    const setupInteractions = () => {
      channels.forEach((channel) => {
        const channelEl = scene.querySelector(`#channel-${channel.id}`) as any;
        if (channelEl) {
          const handleClick = () => {
            setSelectedChannel(channel.id);
            if (onSelectChannel) {
              onSelectChannel(channel.id);
            }
          };
          channelEl.addEventListener("click", handleClick);
          channelEl.addEventListener("fusing", handleClick);
        }
      });

      videos.forEach((video, index) => {
        const videoEl = scene.querySelector(`#video-${video.id}`) as any;
        if (videoEl) {
          const handleClick = () => {
            if (onSelectVideo) {
              onSelectVideo(index, video);
            }
          };
          videoEl.addEventListener("click", handleClick);
          videoEl.addEventListener("fusing", handleClick);
        }
      });

      const favTab = scene.querySelector("#tab-favorites") as any;
      const histTab = scene.querySelector("#tab-history") as any;

      if (favTab) {
        favTab.addEventListener("click", () => setActiveTab("favorites"));
        favTab.addEventListener("fusing", () => setActiveTab("favorites"));
      }
      if (histTab) {
        histTab.addEventListener("click", () => setActiveTab("history"));
        histTab.addEventListener("fusing", () => setActiveTab("history"));
      }
    };

    setTimeout(setupInteractions, 1000);

    return () => {
      scene.removeEventListener("loaded", handleSceneLoaded);
    };
  }, [aframeLoaded, onSelectVideo, onSelectChannel]);

  if (!aframeLoaded) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "18px",
        }}
      >
        Chargement d'A-Frame...
      </div>
    );
  }

  return (
    <div ref={sceneRef} style={{ width: "100%", height: "100vh" }}>
      <a-scene
        vr-mode-ui="enabled: true"
        embedded
        style={{ display: assetsLoaded ? "block" : "none" }}
      >
        <a-assets>
          <a-asset-item id="skybox-glb" src="/models/skybox.glb" />
          {channels.map((ch) => (
            <img
              key={ch.id}
              id={`icon-${ch.id}`}
              src={ch.icon}
              crossOrigin="anonymous"
            />
          ))}
          {videos.map((v) => (
            <img
              key={v.id}
              id={`thumb-${v.id}`}
              src={v.thumbnail}
              crossOrigin="anonymous"
            />
          ))}
          {favorites.map((f) => (
            <img
              key={f.id}
              id={`fav-thumb-${f.id}`}
              src={f.thumbnail}
              crossOrigin="anonymous"
            />
          ))}
          {history.map((h) => (
            <img
              key={h.id}
              id={`hist-thumb-${h.id}`}
              src={h.thumbnail}
              crossOrigin="anonymous"
            />
          ))}
        </a-assets>

        <a-entity
          id="skybox"
          gltf-model="#skybox-glb"
          scale="100 100 100"
          position="0 0 0"
        />

        <a-light type="ambient" color="#ffffff" intensity="0.5" />
        <a-light
          type="directional"
          position="0 5 0"
          color="#ffffff"
          intensity="0.7"
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
            fuse-timeout="600"
            raycaster="objects: .clickable"
            animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.8 0.8 0.8; dur: 600"
            animation__mouseleave="property: scale; startEvents: mouseleave; from: 0.8 0.8 0.8; to: 1 1 1; dur: 200"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: #4CC3D9; shader: flat"
          />
        </a-camera>

        {/* Left Panel - Channels */}
        <a-entity
          id="left-panel"
          position="-1.8 1.5 -3"
          // rotation="0 -5 0"
          animation__float="property: position; to: -1.8 1.6 -3; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate"
        >
          <a-entity
            position="0 0 -0.05"
            geometry="primitive: plane; width: 1.3; height: 2.6"
            material="color: #000000; opacity: 0.3; shader: flat; transparent: true"
          />
          <a-plane
            id="left-panel-bg"
            width="1.2"
            height="2.5"
            color="#2a2c2f"
            opacity="0.94"
            material="shader: flat; transparent: true"
            geometry="primitive: plane; width: 1.2; height: 2.5"
          />
          {channels.map((channel, index) => (
            <a-entity
              key={channel.id}
              id={`channel-${channel.id}`}
              position={`0 ${0.8 - index * 0.4} 0.01`}
              class="clickable"
            >
              <a-plane
                width="1.15"
                height="0.35"
                color={
                  selectedChannel === channel.id ? "#3a3c3f" : "transparent"
                }
                opacity={selectedChannel === channel.id ? "0.8" : "0"}
                material="shader: flat; transparent: true"
                position="0 0 0"
              />
              {selectedChannel === channel.id && (
                <a-box
                  width="0.05"
                  height="0.35"
                  depth="0.01"
                  color="#FFD700"
                  position="-0.55 0 0.02"
                />
              )}
              <a-image
                src={`#icon-${channel.id}`}
                width="0.2"
                height="0.2"
                position="-0.4 0 0.01"
              />
              <a-text
                value={channel.label}
                color={selectedChannel === channel.id ? "#FFD700" : "#ffffff"}
                align="left"
                position="-0.15 0 0.01"
                width="5"
                font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                scale="0.8 0.8 0.8"
              />
              <a-animation
                attribute="scale"
                to="1.05 1.05 1.05"
                dur="200"
                begin="mouseenter"
                fill="forwards"
              />
              <a-animation
                attribute="scale"
                to="1 1 1"
                dur="200"
                begin="mouseleave"
                fill="forwards"
              />
              <a-animation
                attribute="position"
                to="0 0.8 0.01"
                dur="200"
                begin="mouseenter"
                fill="forwards"
              />
              <a-animation
                attribute="position"
                to={`0 ${0.8 - index * 0.4} 0.01`}
                dur="200"
                begin="mouseleave"
                fill="forwards"
              />
            </a-entity>
          ))}
        </a-entity>

        {/* Center Panel - Video Grid */}
        <a-entity
          id="center-panel"
          position="0 1.5 -3"
          animation__float="property: position; to: 0 1.6 -3; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate"
        >
          <a-entity
            position="0 0 -0.05"
            geometry="primitive: plane; width: 3.6; height: 2.6"
            material="color: #000000; opacity: 0.3; shader: flat; transparent: true"
          />
          <a-plane
            id="center-panel-bg"
            width="3.5"
            height="2.5"
            color="#2a2c2f"
            opacity="0.94"
            material="shader: flat; transparent: true"
            geometry="primitive: plane; width: 3.5; height: 2.5"
          />
          {videos.slice(0, 6).map((video, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const xPos = -1 + col * 1;
            const yPos = 0.7 - row * 1.1;
            return (
              <a-entity
                key={video.id}
                id={`video-${video.id}`}
                position={`${xPos} ${yPos} 0.01`}
                class="clickable"
              >
                <a-image
                  src={`#thumb-${video.id}`}
                  width="0.9"
                  height="0.5"
                  position="0 0.15 0.01"
                />
                <a-text
                  value={video.title}
                  color="#ffffff"
                  align="center"
                  position="0 -0.25 0.01"
                  width="3"
                  font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                  scale="0.6 0.6 0.6"
                />
                <a-text
                  value={video.duration}
                  color="#888888"
                  align="center"
                  position="0 -0.4 0.01"
                  width="3"
                  font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                  scale="0.5 0.5 0.5"
                />
                <a-animation
                  attribute="scale"
                  to="1.08 1.08 1.08"
                  dur="200"
                  begin="mouseenter"
                  fill="forwards"
                />
                <a-animation
                  attribute="scale"
                  to="1 1 1"
                  dur="200"
                  begin="mouseleave"
                  fill="forwards"
                />
                <a-entity
                  position="0 0.15 0.02"
                  geometry="primitive: plane; width: 0.95; height: 0.55"
                  material="color: #4CC3D9; opacity: 0; shader: flat; transparent: true"
                  animation__glow="property: material.opacity; to: 0.2; dur: 200; begin: mouseenter; fill: forwards"
                  animation__glowoff="property: material.opacity; to: 0; dur: 200; begin: mouseleave; fill: forwards"
                />
              </a-entity>
            );
          })}
        </a-entity>

        {/* Right Panel - Favorites & History */}
        <a-entity
          id="right-panel"
          position="1.8 1.5 -3"
          // rotation="0 5 0"
          animation__float="property: position; to: 1.8 1.6 -3; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate"
        >
          <a-entity
            position="0 0 -0.05"
            geometry="primitive: plane; width: 1.6; height: 2.6"
            material="color: #000000; opacity: 0.3; shader: flat; transparent: true"
          />
          <a-plane
            id="right-panel-bg"
            width="1.5"
            height="2.5"
            color="#2a2c2f"
            opacity="0.94"
            material="shader: flat; transparent: true"
            geometry="primitive: plane; width: 1.5; height: 2.5"
          />
          <a-entity position="0 1 0.01">
            <a-text
              id="tab-favorites"
              value="Favorites"
              color={activeTab === "favorites" ? "#FFD700" : "#888888"}
              align="center"
              position="-0.3 0 0.01"
              width="3"
              font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
              scale="0.7 0.7 0.7"
              class="clickable"
            />
            <a-text
              id="tab-history"
              value="History"
              color={activeTab === "history" ? "#FFD700" : "#888888"}
              align="center"
              position="0.3 0 0.01"
              width="3"
              font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
              scale="0.7 0.7 0.7"
              class="clickable"
            />
          </a-entity>
          {(activeTab === "favorites" ? favorites : history)
            .slice(0, 6)
            .map((item, index) => (
              <a-entity
                key={item.id}
                id={`${activeTab}-${item.id}`}
                position={`0 ${0.5 - index * 0.35} 0.01`}
                class="clickable"
              >
                <a-image
                  src={`#${
                    activeTab === "favorites" ? "fav-thumb" : "hist-thumb"
                  }-${item.id}`}
                  width="0.25"
                  height="0.15"
                  position="-0.55 0 0.01"
                />
                <a-text
                  value={item.title}
                  color="#ffffff"
                  align="left"
                  position="-0.25 0.05 0.01"
                  width="4"
                  font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                  scale="0.5 0.5 0.5"
                />
                <a-text
                  value={item.duration}
                  color="#888888"
                  align="left"
                  position="-0.25 -0.05 0.01"
                  width="4"
                  font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                  scale="0.4 0.4 0.4"
                />
                <a-animation
                  attribute="scale"
                  to="1.05 1.05 1.05"
                  dur="200"
                  begin="mouseenter"
                  fill="forwards"
                />
                <a-animation
                  attribute="scale"
                  to="1 1 1"
                  dur="200"
                  begin="mouseleave"
                  fill="forwards"
                />
              </a-entity>
            ))}
        </a-entity>
      </a-scene>

      {!assetsLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontSize: "18px",
            zIndex: 1000,
          }}
        >
          Chargement des assets...
        </div>
      )}
    </div>
  );
}
