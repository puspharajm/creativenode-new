import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, PresentationControls, ContactShadows, Text, QuadraticBezierLine, Sphere } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';

interface LoadingScreenProps {
  onComplete: () => void;
}

function PenToolBezier({ progress }: { progress: number }) {
  // A bezier curve that draws itself based on loading progress
  // And shows anchor points like in Illustrator
  const start = new THREE.Vector3(-0.8, -0.2, 0.1);
  const end = new THREE.Vector3(0.8, 1.2, 0.1);
  const mid = new THREE.Vector3(-0.5, 1.5, 0.1);

  // We can't easily animate the 'end' of a QuadraticBezierLine in a simple way without a custom material,
  // but we can animate opacity of the points and lines.
  const isVisible = progress > 20;
  const opacityVal = progress > 20 ? (progress - 20) / 30 : 0;

  return (
    <group>
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color="#d4af37"
        lineWidth={3}
        transparent
        opacity={opacityVal > 1 ? 1 : opacityVal}
        dashed={false}
      />
      {/* Anchor Points */}
      <Sphere args={[0.04, 16, 16]} position={start}>
        <meshBasicMaterial color="#ffffff" transparent opacity={opacityVal > 1 ? 1 : opacityVal} />
      </Sphere>
      <Sphere args={[0.04, 16, 16]} position={end}>
        <meshBasicMaterial color="#ffffff" transparent opacity={opacityVal > 1 ? 1 : opacityVal} />
      </Sphere>
      
      {/* Direction line from start to mid (handle) */}
      <QuadraticBezierLine
        start={start}
        end={mid}
        mid={new THREE.Vector3((start.x+mid.x)/2, (start.y+mid.y)/2, 0.1)}
        color="#888888"
        lineWidth={1.5}
        dashed
        dashScale={5}
        transparent
        opacity={opacityVal > 1 ? 0.5 : opacityVal / 2}
      />
      {/* Handle Point */}
      <Sphere args={[0.03, 16, 16]} position={mid}>
        <meshBasicMaterial color="#888888" transparent opacity={opacityVal > 1 ? 0.8 : opacityVal} />
      </Sphere>
    </group>
  );
}

function PenToolBezier2({ progress }: { progress: number }) {
  const start = new THREE.Vector3(-1.0, -1.0, 0.1);
  const end = new THREE.Vector3(1.0, -0.5, 0.1);
  const mid = new THREE.Vector3(0.0, -1.8, 0.1);
  const opacityVal = progress > 40 ? (progress - 40) / 30 : 0;

  return (
    <group>
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color="#ffffff"
        lineWidth={2}
        transparent
        opacity={opacityVal > 1 ? 1 : opacityVal}
      />
      <Sphere args={[0.03, 16, 16]} position={start}>
        <meshBasicMaterial color="#d4af37" transparent opacity={opacityVal > 1 ? 1 : opacityVal} />
      </Sphere>
      <Sphere args={[0.03, 16, 16]} position={end}>
        <meshBasicMaterial color="#d4af37" transparent opacity={opacityVal > 1 ? 1 : opacityVal} />
      </Sphere>
    </group>
  );
}

function PosterModel({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.mouse.x * Math.PI) / 8, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (state.mouse.y * Math.PI) / 8, 0.05);
    }
  });

  return (
    <group ref={group}>
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.5}>
        {/* Artboard Frame / Device */}
        <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.05]} />
          <meshStandardMaterial color="#121214" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Canvas Area */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[2.8, 4.0]} />
          <meshStandardMaterial color="#0a0a0b" roughness={0.4} metalness={0.6} />
        </mesh>
        
        {/* Artboard Border/Outline representing Vector selection */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.8, 4.0]} />
          <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.3} />
        </mesh>

        {/* 3D Text Branding */}
        <group position={[0, 0.5, 0.1]}>
          <Text
            fontSize={0.35}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuD6fMZhrib2Bg-4.ttf"
            fillOpacity={progress > 30 ? (progress - 30) / 40 : 0}
          >
            CREATIVENODE
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.12}
            color="#d4af37"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.4}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuD6fMZhrib2Bg-4.ttf"
            fillOpacity={progress > 50 ? (progress - 50) / 30 : 0}
          >
            DIGITAL BRANDING SOLUTION
          </Text>
        </group>

        {/* Vector Pen Tool / Illustrator Path graphics */}
        <PenToolBezier progress={progress} />
        <PenToolBezier2 progress={progress} />

        {/* Abstract structural grid appearing at end */}
        <mesh position={[0, 0, 0.05]} ref={meshRef}>
          <planeGeometry args={[2.5, 3.5, 6, 8]} />
          <meshBasicMaterial color="#333333" wireframe transparent opacity={(progress > 70 ? (progress - 70) / 30 : 0) * 0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [percent, setPercent] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    const duration = 4000; // slightly longer to appreciate the vector drawing
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 100);
      
      const easeProgress = rawProgress === 100 ? 100 : 100 * (-Math.pow(2, -10 * rawProgress / 100) + 1);
      
      setPercent(Math.floor(easeProgress));

      if (rawProgress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(onComplete, 800);
        }, 600);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div 
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-[#060608] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-gradient from-gold-500/10 via-zinc-950/60 to-black pointer-events-none" />
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-gold-500/5 rounded-full filter blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 pointer-events-none" />
          
          <div className="absolute inset-0 z-0">
            <Canvas shadows dpr={[1, 2]}>
              <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={50} />
              <ambientLight intensity={0.6} />
              <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
              <spotLight position={[-10, -10, -10]} angle={0.2} penumbra={1} intensity={1} color="#d4af37" />
              
              <PresentationControls 
                global 
                snap={true} 
                rotation={[0, 0, 0]} 
                polar={[-Math.PI / 6, Math.PI / 6]} 
                azimuth={[-Math.PI / 4, Math.PI / 4]}
              >
                <PosterModel progress={percent} />
              </PresentationControls>

              <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={12} blur={3} far={5} />
              <Environment preset="city" />
            </Canvas>
          </div>

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-8 md:p-12 pointer-events-none">
            <motion.div 
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="w-full flex justify-between items-start"
            >
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-zinc-500 font-bold block">
                  CREATIVENODE STUDIO
                </span>
                <span className="font-mono text-[8px] text-gold-400/70 tracking-widest uppercase">
                  Initializing Branding Workspace
                </span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800/50">
                <div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
                <span className="font-mono text-[9px] text-zinc-400 tracking-wider">SYSTEM ONLINE</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-sm flex flex-col items-center gap-5"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-gold-400 text-6xl font-serif italic pr-1 tracking-tighter drop-shadow-lg">
                    {String(percent).padStart(3, '0')}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">%</span>
                </div>
                
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-mono h-4">
                  {percent < 15 ? 'Allocating memory buffers...' : 
                   percent < 35 ? 'Constructing vector paths...' : 
                   percent < 65 ? 'Applying typographic nodes...' : 
                   percent < 90 ? 'Rendering studio lighting passes...' : 
                   'Finalizing digital branding assets...'}
                </span>
              </div>
              
              <div className="w-full h-[2px] bg-zinc-900 overflow-hidden relative rounded-full">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-zinc-800 via-gold-500 to-amber-200"
                  style={{ width: `${percent}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
