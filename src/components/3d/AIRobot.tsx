'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export type RobotEmotion = 'idle' | 'thinking' | 'happy' | 'encouraging' | 'celebrating';

interface AIRobotProps {
  emotion: RobotEmotion;
}

function CuteRobot({ emotion }: AIRobotProps) {
  const robotRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Colors based on emotion
  const colors = useMemo(() => {
    switch (emotion) {
      case 'happy':
      case 'celebrating':
        return { body: '#4ade80', eye: '#22c55e', cheek: '#fca5a5' };
      case 'thinking':
        return { body: '#fbbf24', eye: '#f59e0b', cheek: '#fed7aa' };
      case 'encouraging':
        return { body: '#60a5fa', eye: '#3b82f6', cheek: '#fca5a5' };
      default:
        return { body: '#22d3ee', eye: '#06b6d4', cheek: '#fecaca' };
    }
  }, [emotion]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!robotRef.current) return;

    // Floating animation
    robotRef.current.position.y = Math.sin(t * 1.5) * 0.1;

    // Emotion-based animations
    switch (emotion) {
      case 'celebrating':
        // Bounce and rotate
        robotRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.0;
        robotRef.current.rotation.y = Math.sin(t * 3) * 0.3;
        // Wave arms
        if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 6) * 0.5 + 0.5;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 6) * 0.5 - 0.5;
        break;

      case 'happy':
        robotRef.current.rotation.y = Math.sin(t * 2) * 0.15;
        // Wave one arm
        if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 4) * 0.4 - 0.3;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        break;

      case 'thinking':
        // Tilt head
        robotRef.current.rotation.z = Math.sin(t * 0.8) * 0.1;
        // Hand on chin pose
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.8;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        break;

      case 'encouraging':
        // Thumbs up pose
        robotRef.current.rotation.y = Math.sin(t * 1.5) * 0.1;
        if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 2) * 0.2 - 0.5;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        break;

      default:
        // Idle - gentle sway
        robotRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
        if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t) * 0.1 + 0.2;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t) * 0.1 - 0.2;
    }

    // Eye blink
    const blinkCycle = Math.sin(t * 3) > 0.98;
    const eyeScaleY = blinkCycle ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;

    // Happy eyes (curved)
    if (emotion === 'happy' || emotion === 'celebrating') {
      if (leftEyeRef.current) leftEyeRef.current.scale.y = 0.6;
      if (rightEyeRef.current) rightEyeRef.current.scale.y = 0.6;
    }
  });

  return (
    <group ref={robotRef}>
      {/* Head */}
      <RoundedBox args={[1.2, 1, 0.9]} radius={0.15} smoothness={4} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
      </RoundedBox>

      {/* Face screen */}
      <RoundedBox args={[0.9, 0.6, 0.1]} radius={0.08} position={[0, 0.85, 0.45]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.2} />
      </RoundedBox>

      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.22, 0.9, 0.52]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.22, 0.9, 0.52]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.22, 0.9, 0.62]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.22, 0.9, 0.62]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Mouth - changes with emotion */}
      {(emotion === 'happy' || emotion === 'celebrating') ? (
        // Smiling mouth - rotated to curve upward
        <mesh position={[0, 0.65, 0.5]} rotation={[Math.PI + 0.3, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      ) : emotion === 'thinking' ? (
        // Thinking mouth (small o)
        <mesh position={[0.1, 0.68, 0.52]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      ) : (
        // Neutral mouth
        <RoundedBox args={[0.2, 0.04, 0.02]} radius={0.01} position={[0, 0.68, 0.52]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </RoundedBox>
      )}

      {/* Cheeks */}
      {(emotion === 'happy' || emotion === 'celebrating') && (
        <>
          <mesh position={[-0.4, 0.75, 0.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color={colors.cheek} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.4, 0.75, 0.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color={colors.cheek} transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Antenna */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={emotion === 'thinking' ? '#fbbf24' : colors.eye}
          emissive={emotion === 'thinking' ? '#fbbf24' : colors.eye}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Body */}
      <RoundedBox args={[0.9, 0.8, 0.6]} radius={0.12} position={[0, 0, 0]}>
        <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
      </RoundedBox>

      {/* Chest light */}
      <mesh position={[0, 0.1, 0.32]}>
        <circleGeometry args={[0.12, 24]} />
        <meshStandardMaterial
          color={emotion === 'celebrating' ? '#f472b6' : '#60a5fa'}
          emissive={emotion === 'celebrating' ? '#f472b6' : '#60a5fa'}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.6, 0.1, 0]}>
        <RoundedBox args={[0.2, 0.5, 0.2]} radius={0.05} position={[-0.1, -0.15, 0]}>
          <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
        </RoundedBox>
        {/* Hand */}
        <mesh position={[-0.1, -0.45, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.6, 0.1, 0]}>
        <RoundedBox args={[0.2, 0.5, 0.2]} radius={0.05} position={[0.1, -0.15, 0]}>
          <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
        </RoundedBox>
        {/* Hand */}
        <mesh position={[0.1, -0.45, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {/* Legs */}
      <RoundedBox args={[0.25, 0.4, 0.25]} radius={0.05} position={[-0.2, -0.55, 0]}>
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.25, 0.4, 0.25]} radius={0.05} position={[0.2, -0.55, 0]}>
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.3} />
      </RoundedBox>

      {/* Feet */}
      <RoundedBox args={[0.3, 0.1, 0.35]} radius={0.03} position={[-0.2, -0.8, 0.05]}>
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.1, 0.35]} radius={0.03} position={[0.2, -0.8, 0.05]}>
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
      </RoundedBox>
    </group>
  );
}

export function AIRobot({ emotion = 'idle' }: AIRobotProps) {
  const emotionConfig = useMemo(() => {
    const configs: Record<RobotEmotion, { text: string; emoji: string; color: string; bg: string; borderColor: string }> = {
      thinking: { text: 'Đang suy nghĩ...', emoji: '🤔', color: 'text-yellow-400', bg: 'bg-yellow-400/20', borderColor: 'border-yellow-400/50' },
      happy: { text: 'Tuyệt vời!', emoji: '🎉', color: 'text-green-400', bg: 'bg-green-400/20', borderColor: 'border-green-400/50' },
      encouraging: { text: 'Cố lên nào!', emoji: '💪', color: 'text-blue-400', bg: 'bg-blue-400/20', borderColor: 'border-blue-400/50' },
      celebrating: { text: 'Xuất sắc!', emoji: '🏆', color: 'text-pink-400', bg: 'bg-pink-400/20', borderColor: 'border-pink-400/50' },
      idle: { text: 'Xin chào!', emoji: '👋', color: 'text-cyan-400', bg: 'bg-cyan-400/20', borderColor: 'border-cyan-400/50' },
    };
    return configs[emotion];
  }, [emotion]);

  return (
    <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[320px] relative z-10">
        <Canvas camera={{ position: [0, 0.3, 3.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-3, 2, 4]} intensity={0.5} color="#f472b6" />
          <pointLight position={[3, 2, 4]} intensity={0.5} color="#22d3ee" />

          <CuteRobot emotion={emotion} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        </Canvas>
      </div>

      {/* Speech Bubble */}
      <div className={`relative z-10 px-6 py-3 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-300 ${emotionConfig.borderColor} ${emotionConfig.bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emotionConfig.emoji}</span>
          <span className={`font-bold text-lg ${emotionConfig.color}`}>{emotionConfig.text}</span>
        </div>
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t ${emotionConfig.bg} ${emotionConfig.borderColor}`} />
      </div>

      {/* Celebration effects */}
      {emotion === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {['🎉', '⭐', '🌟', '✨', '🎊', '💫', '🎈'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{ top: `${5 + i * 12}%`, left: `${10 + i * 13}%`, animationDelay: `${i * 0.15}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
        <div className={`w-2 h-2 rounded-full ${emotion === 'thinking' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
        <span className="text-white/60 text-xs">{emotion === 'thinking' ? 'Đang xử lý...' : 'AI Assistant'}</span>
      </div>
    </div>
  );
}

export default AIRobot;
