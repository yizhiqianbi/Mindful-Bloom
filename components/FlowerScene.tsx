
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';

interface FlowerSceneProps {
  gameState: 'IDLE' | 'PRACTICING' | 'COMPLETED';
  onPracticeComplete: () => void;
  onProgressUpdate: (progress: number) => void;
  practiceDuration: number;
}

const FlowerScene: React.FC<FlowerSceneProps> = ({ 
  gameState, 
  onPracticeComplete, 
  onProgressUpdate, 
  practiceDuration 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef(gameState);

  // Keep the ref updated with the latest gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    isPointerDown: false,
    progress: 0,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(99, 99),
    flowerGroup: new THREE.Group(),
    petals: [] as THREE.Mesh[],
    center: null as THREE.Mesh | null,
    petalMaterial: null as THREE.MeshToonMaterial | null,
    light: null as THREE.DirectionalLight | null,
    bloomTimeline: null as gsap.core.Timeline | null,
    glowTimeline: null as gsap.core.Timeline | null,
    lightTimeline: null as gsap.core.Timeline | null,
  }).current;

  // Effect for scene setup, runs only once
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const fogColor = new THREE.Color('#FFF5E1');
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 10, 35);

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stateRef.renderer = renderer;
    mount.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minPolarAngle = Math.PI / 4;
    controls.target.set(0, 2.5, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const directionalLight = new THREE.DirectionalLight(0xffdcb1, 2.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    stateRef.light = directionalLight;

    // Environment
    const skyGeometry = new THREE.SphereGeometry(100, 32, 16);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0xADD8E6) },
        bottomColor: { value: new THREE.Color(0xFFE4B5) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main() { float h = normalize( vWorldPosition + offset ).y; gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 ); }`,
      side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(skyGeometry, skyMaterial));
    
    const ground = new THREE.Mesh(new THREE.CircleGeometry(20, 64), new THREE.MeshStandardMaterial({ color: 0x8BC34A }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const hillGeo = new THREE.SphereGeometry(10, 16, 12);
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x98D88A, flatShading: true });
    [
      {s:[2,0.8,1.5], p:[-15,-2,-10]}, {s:[1.8,1,1.8], p:[12,-1,-15]}, {s:[2.5,1.2,2], p:[5,0,-20]}
    ].forEach(c => {
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.scale.set(c.s[0], c.s[1], c.s[2]);
      hill.position.set(c.p[0], c.p[1], c.p[2]);
      scene.add(hill);
    });

    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200 * 3; i++) positions[i] = (Math.random() - 0.5) * 30;
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: 0xffe4b5, size: 0.15, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    particles.position.y = 5;
    scene.add(particles);

    // Flower
    scene.add(stateRef.flowerGroup);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 4.5, 8), new THREE.MeshToonMaterial({ color: 0x55a630 }));
    stem.position.y = 2.25;
    stem.castShadow = true;
    stateRef.flowerGroup.add(stem);

    const centerMaterial = new THREE.MeshToonMaterial({ color: 0xfcdc4d, emissive: new THREE.Color(0x000000) });
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), centerMaterial);
    center.position.y = 4.7;
    center.castShadow = true;
    stateRef.flowerGroup.add(center);
    stateRef.center = center;

    stateRef.petalMaterial = new THREE.MeshToonMaterial({ color: 0xf4978e, side: THREE.DoubleSide, emissive: new THREE.Color(0x000000) });
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.5, 0.75, 1.5, 1.5, 0, 2.5);
    petalShape.bezierCurveTo(-1.5, 1.5, -0.5, 0.75, 0, 0);
    const petalGeo = new THREE.ShapeGeometry(petalShape);

    stateRef.petals = [];
    [[8, 0.1, 1.1, 0], [12, 0, 1, Math.PI / 12]].forEach(([count, y, scale, angleOffset]) => {
      for (let i = 0; i < count; i++) {
        const petal = new THREE.Mesh(petalGeo, stateRef.petalMaterial);
        petal.castShadow = true;
        const pivot = new THREE.Group();
        pivot.position.set(0, 4.7, 0);
        pivot.rotation.y = (i / count) * Math.PI * 2 + angleOffset;
        petal.position.set(0, y, 0.4);
        petal.rotation.x = Math.PI / 1.2; // Initial closed state
        petal.scale.set(scale, scale, scale);
        pivot.add(petal);
        stateRef.flowerGroup.add(pivot);
        stateRef.petals.push(petal);
      }
    });

    // Event Listeners for Interaction
    const onPointerMove = (e: PointerEvent) => {
      stateRef.pointer.x = (e.clientX / mount.clientWidth) * 2 - 1;
      stateRef.pointer.y = -(e.clientY / mount.clientHeight) * 2 + 1;
    };
    const onPointerDown = (e: PointerEvent) => { onPointerMove(e); stateRef.isPointerDown = true; };
    const onPointerUp = () => { stateRef.isPointerDown = false; };

    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointerleave', onPointerUp);

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const particlePositions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particlePositions.length; i += 3) {
          particlePositions[i] += delta * 0.5;
          if (particlePositions[i] > 15) particlePositions[i] = -15;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // CORE FIX: Use the ref `gameStateRef.current` to get the latest state
      if (gameStateRef.current === 'PRACTICING') {
        stateRef.raycaster.setFromCamera(stateRef.pointer, camera);
        const intersects = stateRef.raycaster.intersectObjects(stateRef.flowerGroup.children, true);
        const isFocusing = intersects.length > 0 || stateRef.isPointerDown;

        // Instant visual feedback for focus
        if (stateRef.center) {
            const targetEmissive = isFocusing ? { r: 0.5, g: 0.3, b: 0.0 } : { r: 0, g: 0, b: 0 };
            gsap.to((stateRef.center.material as THREE.MeshToonMaterial).emissive, {
                ...targetEmissive,
                duration: 0.5,
                ease: 'power2.out'
            });
        }

        // Progress accumulation for long-term focus
        if (isFocusing) {
            if (stateRef.progress < practiceDuration) stateRef.progress += delta;
        } else {
            if (stateRef.progress > 0) stateRef.progress -= delta * 2; // Lose progress faster
        }
        stateRef.progress = Math.max(0, Math.min(practiceDuration, stateRef.progress));
        const progressRatio = stateRef.progress / practiceDuration;

        stateRef.bloomTimeline?.progress(progressRatio);
        stateRef.glowTimeline?.progress(progressRatio);
        stateRef.lightTimeline?.progress(progressRatio);
        onProgressUpdate(progressRatio);

        if (stateRef.progress >= practiceDuration && gameStateRef.current === 'PRACTICING') {
            onPracticeComplete();
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointerleave', onPointerUp);
      if (renderer) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for handling game state changes
  useEffect(() => {
    const { petals, petalMaterial, light, center } = stateRef;
    if (!petals.length || !petalMaterial || !light || !center) return;
  
    stateRef.bloomTimeline?.kill();
    stateRef.glowTimeline?.kill();
    stateRef.lightTimeline?.kill();

    const centerMat = center.material as THREE.MeshToonMaterial;

    if (gameState === 'PRACTICING') {
        stateRef.progress = 0;
        stateRef.bloomTimeline = gsap.timeline({ paused: true }).to(petals.map(p => p.rotation), { x: Math.PI / 4.5, duration: practiceDuration, ease: 'power1.inOut' });
        stateRef.glowTimeline = gsap.timeline({ paused: true }).to(petalMaterial.emissive, { r: 0.8, g: 0.2, b: 0.1, duration: practiceDuration, ease: 'power1.inOut' });
        stateRef.lightTimeline = gsap.timeline({ paused: true }).to(light, { intensity: 4.5, duration: practiceDuration, ease: 'power1.inOut' });
    } else if (gameState === 'IDLE') {
        gsap.to(petals.map(p => p.rotation), { x: Math.PI / 1.2, duration: 1.5, ease: 'power4.inOut' });
        gsap.to(petalMaterial.emissive, { r: 0, g: 0, b: 0, duration: 1.5 });
        gsap.to(centerMat.emissive, { r: 0, g: 0, b: 0, duration: 1.5 });
        gsap.to(light, { intensity: 2.8, duration: 1.5 });
        onProgressUpdate(0);
    } else if (gameState === 'COMPLETED') {
        gsap.to(petalMaterial.emissive, {
          r: 1, g: 0.5, b: 0.4,
          duration: 0.4, yoyo: true, repeat: 3, ease: 'power2.inOut',
        });
        gsap.to(centerMat.emissive, { r: 0, g: 0, b: 0, duration: 0.5 });
    }
  }, [gameState, practiceDuration, onProgressUpdate, stateRef]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default FlowerScene;
