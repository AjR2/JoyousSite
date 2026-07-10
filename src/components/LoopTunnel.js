import React, { useEffect, useRef, useState } from 'react';
import LoopCounter from './LoopCounter';

const SEGMENTS = 160;
const STATION_SPACING = 14;
const OPEN_FRACTION = 0.82;
const CAMERA_START_Z = 5;

function buildRingPositions() {
  const positions = new Float32Array((SEGMENTS + 1) * 3);
  for (let i = 0; i <= SEGMENTS; i++) {
    const theta = (i / SEGMENTS) * Math.PI * 2;
    positions[i * 3] = Math.cos(theta);
    positions[i * 3 + 1] = Math.sin(theta);
    positions[i * 3 + 2] = 0;
  }
  return positions;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function detectCapability() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.innerWidth < 768) return false;
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

// Reusable scroll-driven tunnel canvas. Each "station" is 3 concentric rings
// that ease from an open arc to a fully closed loop as the camera passes it.
function LoopTunnel({ loopCount, color = '#2C5F5A' }) {
  const canvasRef = useRef(null);
  const [capable] = useState(detectCapability);
  const [closedCount, setClosedCount] = useState(0);

  useEffect(() => {
    if (!capable) return;

    let disposed = false;
    let renderer = null;
    let frameId = null;
    const stations = [];

    let handleScroll = () => {};
    let handleResize = () => {};

    (async () => {
      const THREE = await import('three');
      if (disposed || !canvasRef.current) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xF0EDE8, 26, 110);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        200
      );
      camera.position.z = CAMERA_START_Z;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(1);
      renderer.setSize(window.innerWidth, window.innerHeight);

      const basePositions = buildRingPositions();
      const openCount = Math.floor((SEGMENTS + 1) * OPEN_FRACTION);
      const fullCount = SEGMENTS + 1;
      const radii = [1.7, 1.2, 0.7];

      for (let i = 0; i < loopCount; i++) {
        const z = CAMERA_START_Z - (i + 1) * STATION_SPACING;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(basePositions.slice(), 3)
        );
        geometry.setDrawRange(0, openCount);

        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.55,
        });

        radii.forEach((r) => {
          const line = new THREE.Line(geometry, material);
          line.scale.set(r, r, r);
          line.position.z = z;
          scene.add(line);
        });

        stations.push({ z, geometry, material });
      }

      const getScrollProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return 0;
        return Math.min(1, Math.max(0, window.scrollY / max));
      };

      let lastClosed = -1;
      const totalDepth = loopCount * STATION_SPACING;

      const tick = () => {
        const progress = getScrollProgress();
        camera.position.z = CAMERA_START_Z - progress * totalDepth;

        let closed = 0;
        stations.forEach((station) => {
          const remaining = camera.position.z - station.z;
          const t = 1 - Math.min(1, Math.max(0, remaining / (STATION_SPACING * 0.6)));
          const eased = easeInOutCubic(t);
          const count = Math.round(openCount + (fullCount - openCount) * eased);
          station.geometry.setDrawRange(0, count);
          if (eased > 0.96) closed += 1;
        });

        if (closed !== lastClosed) {
          lastClosed = closed;
          setClosedCount(closed);
        }

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(tick);
      };

      // Scroll updates are read inside the single rAF loop above; this listener
      // just keeps the loop aligned with scroll events on inertial/touch scrolling.
      handleScroll = () => {};
      window.addEventListener('scroll', handleScroll, { passive: true });

      handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      frameId = requestAnimationFrame(tick);
    })();

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      stations.forEach((s) => {
        s.geometry.dispose();
        s.material.dispose();
      });
      if (renderer) renderer.dispose();
    };
  }, [capable, loopCount, color]);

  if (!capable) return null;

  return (
    <div className="loop-tunnel" aria-hidden="true">
      <canvas ref={canvasRef} className="loop-tunnel-canvas" />
      <LoopCounter closed={closedCount} total={loopCount} />
    </div>
  );
}

export default LoopTunnel;
