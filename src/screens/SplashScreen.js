import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  SafeAreaView, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#0D0D1A',
  primary: '#5B4CF5',
  white: '#FFFFFF',
};

export default function SplashScreen({ onGetStarted, onLogin }) {
  // ── Animation values ────────────────────────────────────────────────────────
  const cardX        = useRef(new Animated.Value(-width)).current;
  const cardRotate   = useRef(new Animated.Value(-8)).current;
  const wordmarkOp   = useRef(new Animated.Value(0)).current;
  const wordmarkY    = useRef(new Animated.Value(12)).current;
  const buttonsOp    = useRef(new Animated.Value(0)).current;
  const buttonsY     = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      // 1 — card slides in
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(cardX, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.spring(cardRotate, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      // 2 — wordmark fades up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(wordmarkOp, {
          toValue: 1, duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(wordmarkY, {
          toValue: 0, friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // 3 — buttons rise up
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(buttonsOp, {
          toValue: 1, duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsY, {
          toValue: 0, friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const cardStyle = {
    transform: [
      { translateX: cardX },
      {
        rotate: cardRotate.interpolate({
          inputRange: [-8, 0],
          outputRange: ['-8deg', '0deg'],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── Center content ── */}
        <View style={styles.center}>

          {/* Credit Card */}
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Glow effect */}
            <View style={styles.cardGlow} />

            {/* Card content */}
            <View style={styles.cardChip} />
            <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardName}>TabTrack</Text>
              <Text style={styles.cardVisa}>VISA</Text>
            </View>
          </Animated.View>

          {/* Wordmark */}
          <Animated.View style={[
            styles.wordmark,
            { opacity: wordmarkOp, transform: [{ translateY: wordmarkY }] }
          ]}>
            <Text style={styles.wordmarkTitle}>TabTrack</Text>
            <Text style={styles.wordmarkTagline}>Swipe. Split. Done.</Text>
          </Animated.View>

        </View>

        {/* ── Buttons ── */}
        <Animated.View style={[
          styles.buttons,
          { opacity: buttonsOp, transform: [{ translateY: buttonsY }] }
        ]}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={onGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Get Started →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={onLogin}
            activeOpacity={0.75}
          >
            <Text style={styles.btnSecondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: 40 },

  // ── Center ──
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },

  // ── Card ──
  card: {
    width: 260,
    height: 160,
    borderRadius: 20,
    backgroundColor: '#5B4CF5',
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#5B4CF5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 16,
  },
  cardGlow: {
    position: 'absolute',
    top: -20, left: 20, right: 20, bottom: -20,
    backgroundColor: '#7C6FFF',
    borderRadius: 30,
    opacity: 0.25,
    zIndex: -1,
  },
  cardChip: {
    width: 36,
    height: 28,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    opacity: 0.9,
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '500',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardVisa: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
  },

  // ── Wordmark ──
  wordmark: {
    alignItems: 'center',
    gap: 6,
  },
  wordmarkTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  wordmarkTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Buttons ──
  buttons: {
    paddingHorizontal: 28,
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btnSecondaryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
});
