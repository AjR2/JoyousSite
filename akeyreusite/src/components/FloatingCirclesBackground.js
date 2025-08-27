import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const FloatingCirclesBackground = ({ 
  containerRef, 
  circleColor = '#1DA1F2', 
  opacity = 0.1,
  speed = 0.02,
  circleSize = 50 
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current || !containerRef?.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Get container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Camera setup - use container dimensions instead of window
    const camera = new THREE.OrthographicCamera(
      -containerWidth / 2,
      containerWidth / 2,
      containerHeight / 2,
      -containerHeight / 2,
      1,
      1000
    );
    camera.position.z = 100;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for performance
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create hollow circle geometry
    const createHollowCircle = (radius, color, opacity) => {
      const geometry = new THREE.RingGeometry(radius * 0.8, radius, 32);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(geometry, material);
    };

    // Create two circles
    const circle1 = createHollowCircle(circleSize, circleColor, opacity);
    const circle2 = createHollowCircle(circleSize * 0.8, circleColor, opacity * 0.7);

    // Position circles
    circle1.position.set(-200, 100, 0);
    circle2.position.set(200, -100, 0);

    // Add circles to scene
    scene.add(circle1);
    scene.add(circle2);

    // Store circles for animation
    circlesRef.current = [
      {
        mesh: circle1,
        velocity: { x: speed * 100, y: speed * 80 },
        bounds: { width: containerWidth, height: containerHeight }
      },
      {
        mesh: circle2,
        velocity: { x: -speed * 120, y: -speed * 90 },
        bounds: { width: containerWidth, height: containerHeight }
      }
    ];

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Update circle positions
      circlesRef.current.forEach(circle => {
        const { mesh, velocity, bounds } = circle;
        
        // Update position
        mesh.position.x += velocity.x;
        mesh.position.y += velocity.y;

        // Bounce off edges
        const halfWidth = bounds.width / 2;
        const halfHeight = bounds.height / 2;
        const radius = circleSize;

        if (mesh.position.x + radius > halfWidth || mesh.position.x - radius < -halfWidth) {
          velocity.x *= -1;
          // Add slight randomness to prevent perfect synchronization
          velocity.x += (Math.random() - 0.5) * 0.1;
        }

        if (mesh.position.y + radius > halfHeight || mesh.position.y - radius < -halfHeight) {
          velocity.y *= -1;
          // Add slight randomness to prevent perfect synchronization
          velocity.y += (Math.random() - 0.5) * 0.1;
        }

        // Gentle rotation
        mesh.rotation.z += 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle container resize
    const handleResize = () => {
      if (!containerRef?.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      // Update bounds for circles
      circlesRef.current.forEach(circle => {
        circle.bounds = { width, height };
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, [containerRef, circleColor, opacity, speed, circleSize]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
    />
  );
};

export default FloatingCirclesBackground;
