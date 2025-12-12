"use client";

import React, { useEffect, useRef, useState } from "react";
import { channels, videos, favorites, history } from "@/data/videos";
import { VideoItem } from "@/types/video";

/**
 * VRSkyboxMenu
 * - Skybox GLB environment
 * - 3 floating panels (left channels, center grid, right favorites/history)
 * - Clickable thumbnails (no video element, thumbnails are images)
 * - Works in Next.js (client only)
 */

interface VRSkyboxMenuProps {
  onSelectVideo?: (index: number, video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
}

export default function VRSkyboxMenu({
  onSelectVideo,
  onSelectChannel,
}: VRSkyboxMenuProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<"favorites" | "history">(
    "favorites"
  );

  // Load A-Frame client-side only
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).AFRAME) {
      setAframeLoaded(true);
      return;
    }

    // If script already present, poll until window.AFRAME available
    const existing = document.querySelector('script[src*="aframe"]');
    if (existing) {
      const checker = setInterval(() => {
        if ((window as any).AFRAME) {
          clearInterval(checker);
          setAframeLoaded(true);
        }
      }, 100);
      return;
    }

    const s = document.createElement("script");
    s.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
    s.async = true;
    s.onload = () => {
      setAframeLoaded(true);
    };
    document.head.appendChild(s);
  }, []);

  // After A-Frame is loaded, set up listeners for assets and interactions
  useEffect(() => {
    if (!aframeLoaded || !sceneRef.current) return;

    const container = sceneRef.current;
    const scene = container.querySelector("a-scene") as any;
    if (!scene) return;

    // wait for scene loaded
    const onSceneLoaded = () => {
      // Poll assets (images + sky GLB)
      const check = setInterval(() => {
        const assets = scene.querySelector("a-assets");
        if (!assets) return;

        const skyGlb = assets.querySelector("#skybox-glb") as any;
        const imgs = assets.querySelectorAll("img");
        let ok = true;

        // check GLB load state if possible
        if (
          skyGlb &&
          typeof skyGlb.hasLoaded !== "undefined" &&
          skyGlb.hasLoaded === false
        ) {
          ok = false;
        }

        imgs.forEach((img: any) => {
          if (!img.complete || img.naturalWidth === 0) ok = false;
        });

        // require at least one image (thumbnails) to be present
        if (ok && imgs.length > 0) {
          clearInterval(check);
          setAssetsLoaded(true);
        }
      }, 150);
    };

    scene.addEventListener("loaded", onSceneLoaded);

    // Setup interaction handlers (click + fuse)
    const setupInteractions = () => {
      // Channels click
      channels.forEach((ch) => {
        const el = scene.querySelector(`#channel-${ch.id}`) as any;
        if (!el) return;
        const handle = () => {
          setSelectedChannel(ch.id);
          if (onSelectChannel) onSelectChannel(ch.id);
        };
        el.addEventListener("click", handle);
        el.addEventListener("fusing", handle);
      });

      // Video thumbnails
      videos.forEach((v, idx) => {
        const el = scene.querySelector(`#video-${v.id}`) as any;
        if (!el) return;
        const handle = () => {
          if (onSelectVideo) onSelectVideo(idx, v);
        };
        el.addEventListener("click", handle);
        el.addEventListener("fusing", handle);
      });

      // Tabs
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

    // Slight delay so model elements exist
    const t = setTimeout(setupInteractions, 800);

    return () => {
      scene.removeEventListener("loaded", onSceneLoaded);
      clearTimeout(t);
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
        }}
      >
        Chargement d'A-Frame...
      </div>
    );
  }

  // Utility to render a thumbnail tile (center panel)
  const renderThumbnail = (v: VideoItem, index: number) => {
    return (
      <a-entity
        key={v.id}
        id={`video-${v.id}`}
        class="clickable"
        position={`${v.positionX ?? 0} ${v.positionY ?? 0} 0.01`}
      >
        <a-image
          src={`#thumb-${v.id}`}
          width="0.9"
          height="0.5"
          position="0 0.15 0.01"
        />
        <a-text
          value={v.title}
          color="#ffffff"
          align="center"
          position="0 -0.25 0.01"
          width="2.6"
          font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
          scale="0.6 0.6 0.6"
        />
        <a-text
          value={v.duration}
          color="#888888"
          align="center"
          position="0 -0.4 0.01"
          width="2.6"
          font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
          scale="0.5 0.5 0.5"
        />
        {/* Invisible clickable plane for more stable raycasting */}
        <a-plane
          width="0.95"
          height="0.55"
          position="0 0.15 0.015"
          material="opacity:0"
        />
        {/* hover glow */}
        <a-entity
          position="0 0.15 0.016"
          geometry="primitive: plane; width: 0.95; height: 0.55"
          material="color:#FFD700; opacity:0"
          class="hover-glow"
          animation__glow="property: material.opacity; dur:200; startEvents: mouseenter; to:0.14"
          animation__glowoff="property: material.opacity; dur:200; startEvents: mouseleave; to:0"
        />
      </a-entity>
    );
  };

  return (
    <div
      ref={sceneRef}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      <a-scene
        vr-mode-ui="enabled: true"
        embedded
        style={{ width: "100%", height: "100%" }}
        renderer="antialias: true; colorManagement: true"
        fog="type: linear; color: #000000; near: 2; far: 12"
      >
        <a-assets>
          {/* Skybox GLB */}
          <a-asset-item id="skybox-glb" src="/models/skybox.glb" />
          {/* icons */}
          {channels.map((c) => (
            <img
              key={c.id}
              id={`icon-${c.id}`}
              src={c.icon}
              crossOrigin="anonymous"
            />
          ))}
          {/* thumbnails */}
          {videos.map((v) => (
            <img
              key={v.id}
              id={`thumb-${v.id}`}
              src={v.thumbnail}
              crossOrigin="anonymous"
            />
          ))}
          {/* favorites / history thumbs */}
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

        {/* Skybox environment (GLB) */}
        <a-entity
          id="skybox"
          gltf-model="#skybox-glb"
          scale="80 80 80"
          position="0 0 0"
          rotation="0 180 0"
        ></a-entity>

        {/* Lights */}
        <a-entity light="type: ambient; intensity: 0.6; color: #ffffff"></a-entity>
        <a-entity
          light="type: directional; intensity: 1.0; color: #ffffff"
          position="0 6 -2"
        ></a-entity>
        <a-entity
          light="type: directional; intensity: 0.5; color: #88aaff"
          position="-4 4 3"
        ></a-entity>

        {/* Camera + Cursor (gaze + fuse) */}
        <a-entity position="0 1.6 0">
          <a-camera wasd-controls-enabled="false" look-controls="true">
            <a-entity
              cursor="fuse: true; fuseTimeout: 600"
              id="cursor"
              geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              material="color: #ffffff; shader: flat"
              raycaster="objects: .clickable"
              animation__pulse="property: scale; dir: alternate; from: 1 1 1; to: 1.15 1.15 1.15; dur: 800; loop: true"
            />
          </a-camera>
        </a-entity>

        {/* LEFT PANEL - Channels */}
        <a-entity id="left-panel" position="-2.2 1.45 -3" rotation="0 10 0" class="panel" >
          {/* soft back shadow */}
          <a-plane  width="1.65" height="2.8" position="0 0 -0.06" material="color:#000000; opacity:0.25; shader: flat" ></a-plane>
          {/* foreground panel */}
          <a-plane width="1.65" height="2.8" color="#2a2c2f" position="0 0 0" material="shader: flat; transparent: true; opacity:0.96" ></a-plane>

          {/* channel items */}
          {channels.map((ch, i) => (
            <a-entity
              key={ch.id}
              id={`channel-${ch.id}`}
              class="clickable"
              position={`0 ${0.95 - i * 0.38} 0.02`}
            >
              {/* highlight background */}
              <a-plane
                width="1.15"
                height="0.35"
                position="0 0 0.001"
                color={selectedChannel === ch.id ? "#3a3c3f" : "transparent"}
                material="shader: flat; transparent: true"
              />
              {/* left yellow bar */}
              {selectedChannel === ch.id && (
                <a-box
                  width="0.06"
                  height="0.35"
                  depth="0.02"
                  color="#FFD700"
                  position="-0.54 0 0.02"
                />
              )}
              <a-image
                src={`#icon-${ch.id}`}
                width="0.26"
                height="0.26"
                position="-0.38 0 0.02"
              />
              <a-text
                value={ch.label}
                align="left"
                position="-0.05 0 0.02"
                color={selectedChannel === ch.id ? "#FFD700" : "#ffffff"}
                width="3"
                font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                scale="0.8 0.8 0.8"
              />
              {/* hover animation */}
              <a-animation
                attribute="scale"
                begin="mouseenter"
                to="1.04 1.04 1.04"
                dur="180"
              />
              <a-animation
                attribute="scale"
                begin="mouseleave"
                to="1 1 1"
                dur="180"
              />
            </a-entity>
          ))}
        </a-entity>

        {/* CENTER PANEL - Grid (fake curved by 3 columns rotated) */}
        <a-entity id="center-panel" position="0 0 -3" rotation="0 0 0">
          {/* subtle back shadow */}
          <a-plane
            width="3.75"
            height="2.8"
            position="0 0 -0.06"
            material="color:#000000; opacity:0.22; shader: flat"
          ></a-plane>
          <a-plane
            width="3.6"
            height="2.6"
            position="0 0 0"
            color="#2a2c2f"
            material="shader: flat; transparent: true; opacity:0.96"
          ></a-plane>

          {/* We'll build 3 columns (left, center, right) each slightly rotated to simulate curvature */}
          {[-0.9, 0, 0.9].map((colX, colIndex) => {
            const rotY = colIndex === 0 ? 6 : colIndex === 2 ? -6 : 0;
            // compute positions for 2 rows x 3 columns overall — we'll map index
            const colVideos = videos.slice(colIndex * 2, colIndex * 2 + 2); // just split 6 into 3x2
            return (
              <a-entity
                key={`col-${colIndex}`}
                position={`${colX} 0 0.01`}
                rotation={`0 ${rotY} 0`}
              >
                {colVideos.map((v, idx) => {
                  const row = idx; // 0 or 1
                  const yPos = 0.7 - row * 1.05;
                  // position inside this column
                  return (
                    <a-entity
                      key={v.id}
                      id={`video-${v.id}`}
                      class="clickable"
                      position={`0 ${yPos} 0`}
                    >
                      <a-image
                        src={`#thumb-${v.id}`}
                        width="0.95"
                        height="0.52"
                        position="0 0.15 0.01"
                      />
                      <a-text
                        value={v.title}
                        color="#ffffff"
                        align="center"
                        position="0 -0.25 0.01"
                        width="2.2"
                        font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                        scale="0.6 0.6 0.6"
                      />
                      <a-text
                        value={v.duration}
                        color="#888888"
                        align="center"
                        position="0 -0.4 0.01"
                        width="2.2"
                        font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                        scale="0.5 0.5 0.5"
                      />
                      <a-plane
                        width="0.98"
                        height="0.58"
                        position="0 0.15 0.02"
                        material="opacity:0"
                      />
                      <a-entity
                        position="0 0.15 0.025"
                        geometry="primitive: plane; width: 0.98; height: 0.58"
                        material="color:#FFD700; opacity:0"
                        animation__glow="property: material.opacity; dur:180; startEvents: mouseenter; to:0.12"
                        animation__glowoff="property: material.opacity; dur:180; startEvents: mouseleave; to:0"
                      />
                      <a-animation
                        attribute="scale"
                        begin="mouseenter"
                        to="1.08 1.08 1.08"
                        dur="200"
                        fill="forwards"
                      />
                      <a-animation
                        attribute="scale"
                        begin="mouseleave"
                        to="1 1 1"
                        dur="200"
                        fill="forwards"
                      />
                    </a-entity>
                  );
                })}
              </a-entity>
            );
          })}
        </a-entity>

        {/* RIGHT PANEL - Favorites / History */}
        <a-entity id="right-panel" position="2.2 1.45 -3" rotation="0 -10 0">
          <a-plane width="1.65" height="2.8" position="0 0 -0.06" material="color:#000000; opacity:0.25; shader: flat"></a-plane>
          <a-plane width="1.65" height="2.8" position="0 0 0" color="#2a2c2f" material="shader: flat; transparent: true; opacity:0.96"></a-plane>

          <a-entity position="0 1 0.01">
            <a-text
              id="tab-favorites"
              class="clickable"
              value="Favorites"
              color={activeTab === "favorites" ? "#FFD700" : "#888888"}
              align="left"
              position="-0.4 0 0"
              width="2.6"
              font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
              scale="0.7 0.7 0.7"
            ></a-text>
            <a-text
              id="tab-history"
              class="clickable"
              value="History"
              color={activeTab === "history" ? "#FFD700" : "#888888"}
              align="right"
              position="0.4 0 0"
              width="2.6"
              font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
              scale="0.7 0.7 0.7"
            ></a-text>
          </a-entity>

          {(activeTab === "favorites" ? favorites : history)
            .slice(0, 6)
            .map((item, idx) => (
              <a-entity
                key={item.id}
                id={`${activeTab}-${item.id}`}
                class="clickable"
                position={`0 ${0.45 - idx * 0.32} 0.01`}
              >
                <a-image
                  src={`#${
                    activeTab === "favorites" ? "fav-thumb" : "hist-thumb"
                  }-${item.id}`}
                  width="0.28"
                  height="0.16"
                  position="-0.55 0 0.01"
                />
                <a-text
                  value={item.title}
                  color="#ffffff"
                  align="left"
                  position="-0.18 0.06 0.01"
                  width="2.2"
                  font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                  scale="0.48 0.48 0.48"
                />
                <a-text
                  value={item.duration}
                  color="#888888"
                  align="left"
                  position="-0.18 -0.06 0.01"
                  width="2.2"
                  font="https://cdn.aframe.io/fonts/Exo2SemiBold.fnt"
                  scale="0.42 0.42 0.42"
                />
                <a-animation
                  attribute="scale"
                  begin="mouseenter"
                  to="1.04 1.04 1.04"
                  dur="180"
                  fill="forwards"
                />
                <a-animation
                  attribute="scale"
                  begin="mouseleave"
                  to="1 1 1"
                  dur="180"
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
            fontSize: 18,
          }}
        >
          Chargement des assets...
        </div>
      )}
    </div>
  );
}