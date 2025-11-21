import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ORBIT_RADIUS = 120;
const BALL_RADIUS = 8;
const SHIELD_ARC = 60;
const SHIELD_THICKNESS = 10;

export default function App() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const shieldAngle = useRef(0);
  const shieldSpeed = useRef(0.5);
  const ballPos = useRef({ x: 0, y: 0 });
  const ballVel = useRef({ x: 0, y: 0 });
  const ballSpeed = useRef(0.5);

  const loopRef = useRef();

  const shieldAnim = useRef(new Animated.Value(0)).current;
  const ballAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gameStarted && !gameOver) {
      loopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(loopRef.current);
  }, [gameStarted, gameOver]);

  const gameLoop = () => {
    if (gameOver) return;
    shieldAngle.current = (shieldAngle.current + shieldSpeed.current) % 360;
    shieldAnim.setValue(shieldAngle.current);
    let bx = ballPos.current.x + ballVel.current.x;
    let by = ballPos.current.y + ballVel.current.y;
    const dist = Math.sqrt(bx * bx + by * by);
    if (dist >= ORBIT_RADIUS - SHIELD_THICKNESS / 2 - BALL_RADIUS) {
      let ballAngle = (Math.atan2(by, bx) * 180 / Math.PI);
      if (ballAngle < 0) ballAngle += 360;
      let sAngle = shieldAngle.current;
      if (sAngle < 0) sAngle += 360;
      let diff = Math.abs(ballAngle - sAngle);
      if (diff > 180) diff = 360 - diff;
      if (diff < SHIELD_ARC / 2) {
        ballVel.current.x = -ballVel.current.x;
        ballVel.current.y = -ballVel.current.y;
        ballSpeed.current += 0.05;
        const speedMult = ballSpeed.current / Math.sqrt(ballVel.current.x ** 2 + ballVel.current.y ** 2);
        ballVel.current.x *= speedMult;
        ballVel.current.y *= speedMult;
        bx += ballVel.current.x * 2;
        by += ballVel.current.y * 2;
        setScore(s => s + 1);
        triggerShake();
      } else {
        if (dist > ORBIT_RADIUS + 10) {
          setGameOver(true);
          return;
        }
      }
    }
    ballPos.current = { x: bx, y: by };
    ballAnim.setValue({ x: bx, y: by });
    loopRef.current = requestAnimationFrame(gameLoop);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleTap = () => {
    if (gameOver) {
      restartGame();
      return;
    }
    if (!gameStarted) {
      startGame();
      return;
    }
    shieldSpeed.current = -shieldSpeed.current;
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    shieldAngle.current = 0;
    shieldSpeed.current = 1;
    launchBall();
  };

  const launchBall = () => {
    ballPos.current = { x: 0, y: 0 };
    ballSpeed.current = 1;
    const angle = Math.random() * Math.PI * 2;
    ballVel.current = {
      x: Math.cos(angle) * ballSpeed.current,
      y: Math.sin(angle) * ballSpeed.current
    };
  };

  const restartGame = () => {
    startGame();
  };

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={handleTap}>
      <StatusBar style="light" />
      <Text style={styles.bgScore}>{score}</Text>
      <Animated.View style={[styles.gameArea, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.orbitRing} />
        <Animated.View style={[styles.shieldContainer, { transform: [{ rotate: shieldAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }]}>
          <View style={styles.shield} />
        </Animated.View>
        <Animated.View style={[styles.ball, { transform: [{ translateX: ballAnim.x }, { translateY: ballAnim.y }] }]} />
      </Animated.View>
      {!gameStarted && !gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.title}>ORBIT CATCH</Text>
          <Text style={styles.sub}>Tap to Reverse Shield</Text>
          <Text style={styles.sub}>Catch the Ball</Text>
        </View>
      )}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={[styles.title, { color: '#ff3333' }]}>MISSED</Text>
          <Text style={styles.sub}>Tap to Retry</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  bgScore: { position: 'absolute', top: 100, fontSize: 100, fontWeight: 'bold', color: '#222', fontFamily: 'Courier' },
  gameArea: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center' },
  orbitRing: { position: 'absolute', width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2, borderRadius: ORBIT_RADIUS, borderWidth: 2, borderColor: '#222' },
  shieldContainer: { position: 'absolute', width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2, alignItems: 'center', justifyContent: 'center' },
  shield: { position: 'absolute', right: -SHIELD_THICKNESS / 2, width: SHIELD_THICKNESS, height: 80, backgroundColor: '#00ffff', borderRadius: 5, shadowColor: '#00ffff', shadowOpacity: 1, shadowRadius: 10 },
  ball: { position: 'absolute', width: BALL_RADIUS * 2, height: BALL_RADIUS * 2, borderRadius: BALL_RADIUS, backgroundColor: '#fff', shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: 10 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#fff', marginBottom: 10, fontFamily: 'Courier', letterSpacing: 2 },
  sub: { fontSize: 18, color: '#888', fontFamily: 'Courier', marginBottom: 5 }
});
