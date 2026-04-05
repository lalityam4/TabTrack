import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Alert, Platform, Animated, Dimensions,
  FlatList, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#5B4CF5',
  primaryLight: '#EDE9FE',
  bg: '#F5F6FA',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSoft: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

// ─── Step Dots ─────────────────────────────────────────────────────────────────
function StepDots({ current, total, dark }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            dark && { backgroundColor: 'rgba(255,255,255,0.25)' },
            i === current && (dark ? styles.dotActiveDark : styles.dotActive),
          ]}
        />
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  FEATURE ANIMATIONS
// ══════════════════════════════════════════════════════════════════════

// 1 — Notification drops in
function NotifyAnimation({ active }) {
  const slideY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!active) return;
    slideY.setValue(-80); opacity.setValue(0); scale.setValue(0.9);
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(opacity,  { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(scale,    { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      ]),
    ]).start();
  }, [active]);

  return (
    <View style={animStyles.notifyScene}>
      {/* Phone outline */}
      <View style={animStyles.phoneMock}>
        <View style={animStyles.phoneSpeaker} />
        {/* Notification banner */}
        <Animated.View style={[
          animStyles.notifBanner,
          { transform: [{ translateY: slideY }, { scale }], opacity }
        ]}>
          <View style={animStyles.notifIcon}>
            <Ionicons name="card" size={16} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={animStyles.notifTitle}>New charge · Carbone</Text>
            <Text style={animStyles.notifSub}>$243.50 · Group or Just me?</Text>
          </View>
        </Animated.View>
        {/* Lock screen time */}
        <Text style={animStyles.lockTime}>9:41</Text>
      </View>
    </View>
  );
}

// 2 — Avatars pop in one by one
function SplitAnimation({ active }) {
  const people = [
    { name: 'You',   color: '#5B4CF5', delay: 100 },
    { name: 'Priya', color: '#10B981', delay: 350 },
    { name: 'Jake',  color: '#F59E0B', delay: 600 },
  ];
  const scales  = people.map(() => useRef(new Animated.Value(0)).current);
  const opacities = people.map(() => useRef(new Animated.Value(0)).current);
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    scales.forEach(s => s.setValue(0));
    opacities.forEach(o => o.setValue(0));
    lineWidth.setValue(0);

    const anims = people.map((p, i) =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.spring(scales[i],   { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
          Animated.timing(opacities[i],{ toValue: 1, duration: 250, useNativeDriver: true }),
        ]),
      ])
    );

    Animated.parallel([
      ...anims,
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(lineWidth, { toValue: 1, duration: 400, useNativeDriver: false }),
      ]),
    ]).start();
  }, [active]);

  return (
    <View style={animStyles.splitScene}>
      <View style={animStyles.avatarRow}>
        {people.map((p, i) => (
          <Animated.View key={p.name} style={[
            animStyles.avatarWrap,
            { transform: [{ scale: scales[i] }], opacity: opacities[i] }
          ]}>
            <View style={[animStyles.avatar, { backgroundColor: p.color + '22', borderColor: p.color }]}>
              <Text style={[animStyles.avatarText, { color: p.color }]}>{p.name[0]}</Text>
            </View>
            <Text style={animStyles.avatarLabel}>{p.name}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[
        animStyles.splitBill,
        { opacity: lineWidth, transform: [{ scaleX: lineWidth }] }
      ]}>
        <Ionicons name="calculator-outline" size={14} color={COLORS.primary} />
        <Text style={animStyles.splitBillText}>$81.17 each · 3 people</Text>
      </Animated.View>
    </View>
  );
}

// 3 — Trip cards stack in
function TripAnimation({ active }) {
  const cards = [
    { name: 'NYC Weekend',   date: 'Mar 27–30', color: '#5B4CF5', delay: 100 },
    { name: 'Cabo May 2026', date: 'May 3–8',   color: '#10B981', delay: 350 },
  ];
  const cardAnims = cards.map(() => ({
    x: useRef(new Animated.Value(-SCREEN_WIDTH)).current,
    op: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    if (!active) return;
    cardAnims.forEach(a => { a.x.setValue(-SCREEN_WIDTH); a.op.setValue(0); });

    Animated.parallel(
      cards.map((c, i) =>
        Animated.sequence([
          Animated.delay(c.delay),
          Animated.parallel([
            Animated.spring(cardAnims[i].x, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
            Animated.timing(cardAnims[i].op, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ])
      )
    ).start();
  }, [active]);

  return (
    <View style={animStyles.tripScene}>
      {cards.map((c, i) => (
        <Animated.View key={c.name} style={[
          animStyles.tripCard,
          { backgroundColor: c.color + '15', borderColor: c.color + '40' },
          { transform: [{ translateX: cardAnims[i].x }], opacity: cardAnims[i].op },
        ]}>
          <View style={[animStyles.tripCardDot, { backgroundColor: c.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={animStyles.tripCardName}>{c.name}</Text>
            <Text style={animStyles.tripCardDate}>{c.date}</Text>
          </View>
          <View style={[animStyles.tripCardBadge, { backgroundColor: c.color }]}>
            <Text style={animStyles.tripCardBadgeText}>LIVE</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// 4 — Amount counts up
function ShareAnimation({ active }) {
  const amount  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [displayAmt, setDisplayAmt] = useState('0.00');

  useEffect(() => {
    if (!active) return;
    amount.setValue(0); opacity.setValue(0); setDisplayAmt('0.00');

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(amount,  { toValue: 81.17, duration: 1200, useNativeDriver: false }),
    ]).start();

    const listener = amount.addListener(({ value }) => {
      setDisplayAmt(value.toFixed(2));
    });
    return () => amount.removeListener(listener);
  }, [active]);

  return (
    <Animated.View style={[animStyles.shareScene, { opacity }]}>
      <View style={animStyles.shareCard}>
        <Text style={animStyles.shareLabel}>YOUR SHARE</Text>
        <Text style={animStyles.shareAmount}>${displayAmt}</Text>
        <Text style={animStyles.shareSub}>from 3 group charges · Cabo trip</Text>

        <View style={animStyles.shareBreakdown}>
          {[
            { m: 'Carbone',     a: '$81.17' },
            { m: 'Hotel Xcaret',a: '$125.00' },
            { m: 'Cenote Tour', a: '$30.00' },
          ].map((r, i) => (
            <View key={i} style={animStyles.shareRow}>
              <Text style={animStyles.shareMerchant}>{r.m}</Text>
              <Text style={animStyles.shareAmt}>{r.a}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// 5 — Settlement stamp
function SettleAnimation({ active }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const rotate  = useRef(new Animated.Value(-15)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cardOp  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    scale.setValue(0); rotate.setValue(-15); opacity.setValue(0); cardOp.setValue(0);

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(cardOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(scale,  { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.spring(rotate, { toValue: -6, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(opacity,{ toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, [active]);

  return (
    <View style={animStyles.settleScene}>
      <Animated.View style={[animStyles.settleCard, { opacity: cardOp }]}>
        <Text style={animStyles.settleCardTitle}>NYC Weekend · Settlement</Text>
        {[
          { name: 'Jake owes Priya', amount: '$54.20' },
          { name: 'You owe Jake',    amount: '$12.40' },
        ].map((r, i) => (
          <View key={i} style={animStyles.settleRow}>
            <Text style={animStyles.settleName}>{r.name}</Text>
            <Text style={animStyles.settleAmt}>{r.amount}</Text>
          </View>
        ))}
      </Animated.View>

      {/* SETTLED stamp */}
      <Animated.View style={[
        animStyles.settleStamp,
        {
          opacity,
          transform: [
            { scale },
            { rotate: rotate.interpolate({ inputRange: [-15, -6], outputRange: ['-15deg', '-6deg'] }) },
          ],
        },
      ]}>
        <Text style={animStyles.settleStampText}>SETTLED</Text>
      </Animated.View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  FEATURE CAROUSEL
// ══════════════════════════════════════════════════════════════════════
const SLIDES = [
  {
    key: 'notify',
    color: COLORS.warning,
    colorLight: COLORS.warningLight,
    icon: 'flash',
    title: 'Instant notification\nwhen you swipe',
    desc: 'The moment your card is charged, TabTrack asks — group or just you?',
    Animation: NotifyAnimation,
  },
  {
    key: 'split',
    color: COLORS.primary,
    colorLight: COLORS.primaryLight,
    icon: 'people',
    title: 'Split with trip mates\nin seconds',
    desc: 'Pick who was there and we calculate everyone\'s share instantly.',
    Animation: SplitAnimation,
  },
  {
    key: 'trips',
    color: '#10B981',
    colorLight: '#D1FAE5',
    icon: 'map',
    title: 'Track every trip\nseparately',
    desc: 'Run multiple trips at once. Cabo and NYC? No problem — fully separate.',
    Animation: TripAnimation,
  },
  {
    key: 'share',
    color: '#8B5CF6',
    colorLight: '#EDE9FE',
    icon: 'calculator',
    title: 'Know exactly\nwhat you owe',
    desc: 'See your personal share from every group charge before the trip ends.',
    Animation: ShareAnimation,
  },
  {
    key: 'settle',
    color: COLORS.success,
    colorLight: COLORS.successLight,
    icon: 'checkmark-circle',
    title: 'Clean settlement\nat trip end',
    desc: 'One tap generates a full settlement summary. No spreadsheets, no arguments.',
    Animation: SettleAnimation,
  },
];

function FeatureCarousel({ onFinish }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-advance every 3s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        if (prev < SLIDES.length - 1) {
          const next = prev + 1;
          flatRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        }
        clearInterval(timerRef.current);
        return prev;
      });
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
      clearInterval(timerRef.current); // user took control — stop auto
    }
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    } else {
      onFinish();
    }
  };

  const slide = SLIDES[activeIndex];

  return (
    <View style={styles.carouselWrap}>
      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH - 48 }]}>
            {/* Animation area */}
            <View style={[styles.animBox, { backgroundColor: item.colorLight }]}>
              <item.Animation active={index === activeIndex} />
            </View>

            {/* Eyebrow label */}
            <View style={styles.slideEyebrow}>
              <View style={[styles.slideEyebrowDot, { backgroundColor: item.color }]} />
              <Text style={[styles.slideEyebrowText, { color: item.color }]}>
                {['Notifications', 'Splitting', 'Trip Tracking', 'Your Share', 'Settlement'][index]}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.slideTitle}>{item.title}</Text>

            {/* Description */}
            <Text style={styles.slideDesc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Progress dots */}
      <View style={styles.slideDots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[
            styles.slideDot,
            i === activeIndex && { backgroundColor: slide.color, width: 20 },
          ]} />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.slideBtn, { backgroundColor: slide.color, shadowColor: slide.color }]}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.slideBtnText}>
          {activeIndex === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
        </Text>
      </TouchableOpacity>

      {activeIndex < SLIDES.length - 1 && (
        <TouchableOpacity onPress={onFinish} style={styles.skipLink}>
          <Text style={styles.skipLinkText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Step 1: Welcome (now uses carousel) ──────────────────────────────────────
function WelcomeStep({ onNext }) {
  return (
    <View style={styles.stepContainer}>
      {/* ── Hero Header ── */}
      <View style={styles.heroHeader}>
        {/* Icon + title row */}
        <View style={styles.heroTitleRow}>
          <View style={styles.heroIconBadge}>
            <Text style={{ fontSize: 22 }}>🧾</Text>
          </View>
          <Text style={styles.heroTitle}>TabTrack</Text>
        </View>

        {/* Tagline pills */}
        <View style={styles.taglineRow}>
          {['SWIPE', 'SPLIT', 'DONE'].map((word, i) => (
            <React.Fragment key={word}>
              <View style={[
                styles.taglinePill,
                i === 2 && { backgroundColor: COLORS.primary },
              ]}>
                <Text style={[
                  styles.taglinePillText,
                  i === 2 && { color: '#fff' },
                ]}>
                  {word}
                </Text>
              </View>
              {i < 2 && <Text style={styles.taglineDot}>·</Text>}
            </React.Fragment>
          ))}
        </View>
      </View>

      <FeatureCarousel onFinish={onNext} />
    </View>
  );
}

// ─── Step 2: Connect Card ─────────────────────────────────────────────────────
const CHECKLIST = [
  { icon: 'link-outline',           label: 'Plaid connection established' },
  { icon: 'lock-closed-outline',    label: 'Read-only access granted' },
  { icon: 'flash-outline',          label: 'Charge alerts activated' },
];

function ConnectCardStep({ onNext }) {
  const [phase, setPhase] = useState('idle'); // idle | connecting | done
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim     = useRef(new Animated.Value(0)).current;
  const checkAnims   = CHECKLIST.map(() => useRef(new Animated.Value(0)).current);

  const startConnect = () => {
    setPhase('connecting');

    // Spinner loop
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Progress bar fills to 100%
    Animated.timing(progressAnim, {
      toValue: 1, duration: 2800, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();

    // Checklist items tick in one by one
    CHECKLIST.forEach((_, i) => {
      Animated.sequence([
        Animated.delay(600 + i * 700),
        Animated.spring(checkAnims[i], { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]).start();
    });

    // Done after all items appear
    setTimeout(() => setPhase('done'), 600 + CHECKLIST.length * 700 + 400);
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.connectSafe}>
      <View style={styles.connectInner}>

        {/* Card visual */}
        <View style={styles.connectCard}>
          <View style={styles.connectCardShine} />
          <View style={styles.connectCardChip} />
          <Text style={styles.connectCardNum}>•••• •••• •••• 4242</Text>
          <View style={styles.connectCardBottom}>
            <Text style={styles.connectCardName}>Chase Sapphire Reserve</Text>
            <Text style={styles.connectCardBrand}>VISA</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.connectTitle}>Connect your card</Text>
        <Text style={styles.connectSub}>
          TabTrack monitors your card for new charges — read-only, no payments ever.
        </Text>

        {/* Connecting state */}
        {phase === 'connecting' || phase === 'done' ? (
          <View style={styles.connectProgress}>
            {/* Spinner + label */}
            <View style={styles.connectingRow}>
              {phase === 'connecting' ? (
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
              ) : (
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              )}
              <Text style={[styles.connectingText, phase === 'done' && { color: COLORS.success }]}>
                {phase === 'done' ? 'Connected!' : 'Connecting securely…'}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>

            {/* Checklist */}
            <View style={styles.checklist}>
              {CHECKLIST.map((item, i) => (
                <Animated.View key={i} style={[
                  styles.checkRow,
                  { opacity: checkAnims[i], transform: [{ translateX: checkAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] }
                ]}>
                  <View style={styles.checkIconWrap}>
                    <Ionicons name={item.icon} size={15} color={COLORS.primary} />
                  </View>
                  <Text style={styles.checkLabel}>{item.label}</Text>
                  <Ionicons name="checkmark" size={14} color={COLORS.success} />
                </Animated.View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Buttons */}
        <View style={styles.connectFooter}>
          {phase === 'done' ? (
            <TouchableOpacity style={styles.connectBtn} onPress={onNext} activeOpacity={0.85}>
              <Text style={styles.connectBtnText}>Continue →</Text>
            </TouchableOpacity>
          ) : phase === 'idle' ? (
            <>
              <TouchableOpacity style={styles.connectBtn} onPress={startConnect} activeOpacity={0.85}>
                <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.connectBtnText}>Connect Demo Card</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onNext} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: 'rgba(255,255,255,0.4)' }]}>Skip for now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.connectBtn, { opacity: 0.4 }]}>
              <Text style={styles.connectBtnText}>Connecting…</Text>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

// ─── Step 3: Home Location ────────────────────────────────────────────────────
function HomeLocationStep({ onNext }) {
  const [location, setLocation] = useState('San Francisco, CA');
  const [radius, setRadius] = useState('50');

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set your home base</Text>
      <Text style={styles.stepSubtitle}>
        When you travel beyond this distance, TabTrack asks if you're starting a trip.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Home city</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={18} color={COLORS.textSoft} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor={COLORS.textSoft}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Trip detection radius</Text>
        <View style={styles.radiusOptions}>
          {['25', '50', '100', '200'].map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>
                {r} mi
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.detectionNote}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
        <Text style={styles.detectionNoteText}>
          You can always start a trip manually — this is just for auto-detection.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 4: All Set ──────────────────────────────────────────────────────────
function AllSetStep({ onDone }) {
  return (
    <View style={[styles.stepContainer, { alignItems: 'center' }]}>
      <View style={styles.allSetIcon}>
        <Text style={{ fontSize: 56 }}>✅</Text>
      </View>
      <Text style={styles.allSetTitle}>You're all set!</Text>
      <Text style={styles.allSetSubtitle}>
        TabTrack is ready. The moment a charge posts to your card, you'll get a
        notification: Group or Just me. That's it.
      </Text>

      <View style={styles.reminderCard}>
        <Text style={styles.reminderTitle}>How it works</Text>
        {[
          'You swipe your card',
          'Notification arrives in seconds',
          'Tap Group or Just me',
          'Assign trip mates later',
          'Settlement sent at trip end',
        ].map((step, i) => (
          <View key={i} style={styles.reminderRow}>
            <Text style={styles.reminderNum}>{i + 1}</Text>
            <Text style={styles.reminderText}>{step}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onDone} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Start using TabTrack</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Onboarding Component ────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useApp();
  const TOTAL_STEPS = 4;
  const isConnectStep = step === 1;

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };

  const steps = [
    <WelcomeStep onNext={next} />,
    <ConnectCardStep onNext={next} />,
    <HomeLocationStep onNext={next} />,
    <AllSetStep onDone={completeOnboarding} />,
  ];

  return (
    <SafeAreaView style={[styles.safe, isConnectStep && { backgroundColor: '#000' }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isConnectStep && { paddingHorizontal: 0, paddingBottom: 0, paddingTop: 0 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step > 0 && (
          <View style={[styles.header, isConnectStep && styles.headerDark, isConnectStep && { paddingHorizontal: 20 }]}>
            <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={isConnectStep ? '#fff' : COLORS.text} />
            </TouchableOpacity>
            <StepDots current={step} total={TOTAL_STEPS} dark={isConnectStep} />
            <View style={{ width: 32 }} />
          </View>
        )}
        {steps[step]}
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ANIMATION STYLES
// ══════════════════════════════════════════════════════════════════════
const animStyles = StyleSheet.create({
  // 1 — Notify
  notifyScene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  phoneMock: {
    width: 160, height: 180, borderRadius: 24,
    backgroundColor: '#1A1A2E', borderWidth: 4, borderColor: '#2D2D44',
    alignItems: 'center', overflow: 'hidden', paddingTop: 16,
  },
  phoneSpeaker: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#2D2D44', marginBottom: 12,
  },
  notifBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 6, borderRadius: 12, padding: 10,
  },
  notifIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: { fontSize: 9, fontWeight: '700', color: COLORS.text },
  notifSub: { fontSize: 8, color: COLORS.textSoft, marginTop: 1 },
  lockTime: { fontSize: 28, fontWeight: '200', color: 'white', marginTop: 16 },

  // 2 — Split
  splitScene: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  avatarRow: { flexDirection: 'row', gap: 20 },
  avatarWrap: { alignItems: 'center', gap: 6 },
  avatar: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: { fontSize: 20, fontWeight: '800' },
  avatarLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSoft },
  splitBill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  splitBillText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // 3 — Trip cards
  tripScene: { flex: 1, justifyContent: 'center', gap: 10, paddingHorizontal: 8 },
  tripCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 14, borderWidth: 1,
  },
  tripCardDot: { width: 8, height: 8, borderRadius: 4 },
  tripCardName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  tripCardDate: { fontSize: 11, color: COLORS.textSoft, marginTop: 1 },
  tripCardBadge: {
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  tripCardBadgeText: { fontSize: 9, fontWeight: '800', color: 'white', letterSpacing: 0.5 },

  // 4 — Share
  shareScene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shareCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  shareLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textSoft,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
  },
  shareAmount: {
    fontSize: 34, fontWeight: '800', color: '#8B5CF6', letterSpacing: -1, marginBottom: 2,
  },
  shareSub: { fontSize: 11, color: COLORS.textSoft, marginBottom: 12 },
  shareBreakdown: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, gap: 6 },
  shareRow: { flexDirection: 'row', justifyContent: 'space-between' },
  shareMerchant: { fontSize: 12, color: COLORS.textSoft },
  shareAmt: { fontSize: 12, fontWeight: '600', color: COLORS.text },

  // 5 — Settle
  settleScene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settleCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14,
    width: '100%', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  settleCardTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textSoft, marginBottom: 2 },
  settleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settleName: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  settleAmt: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  settleStamp: {
    position: 'absolute',
    borderWidth: 3, borderColor: COLORS.success,
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4,
  },
  settleStampText: {
    fontSize: 20, fontWeight: '900', color: COLORS.success, letterSpacing: 3,
  },
});

// ══════════════════════════════════════════════════════════════════════
//  SCREEN STYLES
// ══════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 8,
  },
  backBtn: { padding: 6 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { width: 20, backgroundColor: COLORS.primary },
  dotActiveDark: { width: 20, backgroundColor: '#fff' },

  stepContainer: { paddingTop: 16, flex: 1 },

  // Hero header
  heroHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
  },
  heroTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  heroIconBadge: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  heroTitle: {
    fontSize: 36, fontWeight: '900', color: COLORS.text,
    letterSpacing: -1.5,
  },
  taglineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  taglinePill: {
    backgroundColor: 'rgba(91,76,245,0.1)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  taglinePillText: {
    fontSize: 12, fontWeight: '800', color: COLORS.primary,
    letterSpacing: 1.5,
  },
  taglineDot: {
    fontSize: 14, color: COLORS.textSoft, fontWeight: '300',
  },

  // Carousel
  carouselWrap: { flex: 1 },
  slide: { alignSelf: 'center' },
  animBox: {
    height: 180, borderRadius: 20, marginBottom: 14,
    overflow: 'hidden', padding: 16,
  },

  slideEyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6,
  },
  slideEyebrowDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  slideEyebrowText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
  },

  slideTitle: {
    fontSize: 24, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 8, lineHeight: 31,
  },
  slideDesc: {
    fontSize: 14, color: COLORS.textSoft,
    lineHeight: 22, marginBottom: 14, fontWeight: '400', letterSpacing: 0.1,
  },
  slideDots: {
    flexDirection: 'row', gap: 6,
    justifyContent: 'center', marginBottom: 12,
  },
  slideDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  slideBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  slideBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  skipLink: { alignItems: 'center', paddingVertical: 8 },
  skipLinkText: { fontSize: 14, color: COLORS.textSoft, fontWeight: '500' },

  // Step title
  stepTitle: {
    fontSize: 28, fontWeight: '800', color: COLORS.text,
    marginBottom: 10, letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 15, color: COLORS.textSoft, lineHeight: 23, marginBottom: 32,
  },

  // Plaid
  plaidBtn: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white, marginBottom: 12,
  },
  plaidBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  plaidBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },

  // Connected card
  connectedCard: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  connectedCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connectedIconWrap: {},
  connectedCardName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  connectedCardSub: { fontSize: 13, color: COLORS.textSoft, marginTop: 2 },
  removeText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },

  securityNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32,
  },
  securityText: { fontSize: 12, color: COLORS.textSoft, flex: 1 },

  // Inputs
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, backgroundColor: COLORS.white,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.text },

  // Radius
  radiusOptions: { flexDirection: 'row', gap: 10 },
  radiusChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.white,
  },
  radiusChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radiusChipText: { fontSize: 14, fontWeight: '600', color: COLORS.textSoft },
  radiusChipTextActive: { color: COLORS.primary },

  detectionNote: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    padding: 12, marginBottom: 32,
  },
  detectionNoteText: { fontSize: 13, color: COLORS.primary, flex: 1, lineHeight: 19 },

  // All set
  allSetIcon: { alignSelf: 'center', marginBottom: 24, marginTop: 16 },
  allSetTitle: {
    fontSize: 30, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', marginBottom: 12,
  },
  allSetSubtitle: {
    fontSize: 16, color: COLORS.textSoft, textAlign: 'center',
    lineHeight: 24, marginBottom: 32,
  },
  reminderCard: {
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20,
    marginBottom: 32, borderWidth: 1, borderColor: COLORS.border,
  },
  reminderTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reminderNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.primary, color: '#fff',
    fontSize: 12, fontWeight: '700',
    textAlign: 'center', lineHeight: 22, marginRight: 10,
  },
  reminderText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },

  // Connect Card Step (black background, Option 4 live-progress)
  connectSafe: {
    flex: 1,
    backgroundColor: '#000',
  },
  connectInner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectCard: {
    width: 280,
    height: 170,
    backgroundColor: '#1A1A2E',
    borderRadius: 22,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#5B4CF5',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 14,
    marginBottom: 28,
  },
  connectCardShine: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 130,
    height: 130,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 65,
  },
  connectCardChip: {
    width: 36,
    height: 28,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    opacity: 0.9,
  },
  connectCardNum: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '500',
  },
  connectCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  connectCardName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  connectCardBrand: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  connectTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  connectSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  connectProgress: {
    width: '100%',
    marginBottom: 20,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: 'rgba(91,76,245,0.25)',
    borderTopColor: COLORS.primary,
  },
  connectingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 18,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  checklist: {
    gap: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(91,76,245,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  connectFooter: {
    width: '100%',
    gap: 12,
  },
  connectBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  connectBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.1,
  },

  // Dark header variant (for connect step)
  headerDark: {
    borderBottomWidth: 0,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    padding: 17, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  primaryBtnDisabled: { backgroundColor: '#C4B5FD' },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  skipBtn: { alignItems: 'center', marginTop: 14 },
  skipText: { fontSize: 14, color: COLORS.textSoft, fontWeight: '500' },
});
