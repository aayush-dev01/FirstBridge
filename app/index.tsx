import { useEffect } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'

const { width: W, height: H } = Dimensions.get('window')

export default function SplashScreen() {
  const router = useRouter()

  const pulse       = useSharedValue(1)
  const pulseOp     = useSharedValue(0.3)
  const logoOp      = useSharedValue(0)
  const logoY       = useSharedValue(30)
  const nameOp      = useSharedValue(0)
  const nameY       = useSharedValue(20)
  const tagOp       = useSharedValue(0)
  const barProgress = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,    { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    pulseOp.value = withRepeat(
      withSequence(
        withTiming(0.08, { duration: 1800 }),
        withTiming(0.3,  { duration: 1800 }),
      ),
      -1,
      false,
    )

    logoOp.value = withDelay(200,  withTiming(1, { duration: 800 }))
    logoY.value  = withDelay(200,  withSpring(0, { damping: 7, stiffness: 50 }))
    nameOp.value = withDelay(800,  withTiming(1, { duration: 600 }))
    nameY.value  = withDelay(800,  withSpring(0, { damping: 8, stiffness: 60 }))
    tagOp.value  = withDelay(1200, withTiming(1, { duration: 500 }))
    barProgress.value = withDelay(800, withTiming(1, {
      duration: 2400,
      easing: Easing.out(Easing.ease),
    }))

    const nav = setTimeout(() => router.replace('/(auth)/welcome'), 3600)
    return () => clearTimeout(nav)
  }, [])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity:   pulseOp.value,
  }))
  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOp.value,
    transform: [{ translateY: logoY.value }],
  }))
  const nameStyle = useAnimatedStyle(() => ({
    opacity:   nameOp.value,
    transform: [{ translateY: nameY.value }],
  }))
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOp.value,
  }))
  const barStyle = useAnimatedStyle(() => ({
    width: barProgress.value * W * 0.55,
  }))

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['#030810', '#071428', '#0A1E3C', '#071428', '#030810']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[s.glowRingOuter, pulseStyle]} />
      <View style={s.glowRingMid} />
      <View style={s.glowCore} />

      <Animated.View style={logoStyle}>
        <View style={s.logoShadow}>
          <Image
            source={require('../assets/images/logo.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <Animated.Text style={[s.wordmark, nameStyle]}>
        FirstBridge
      </Animated.Text>

      <Animated.View style={[s.tagRow, tagStyle]}>
        {(['Scholarship', 'Mentorship', 'Community'] as const).map((word, i) => (
          <View key={word} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {i > 0 && <View style={s.tagDot} />}
            <Text style={s.tagWord}>{word}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[s.progressWrap, tagStyle]}>
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, barStyle]} />
        </View>
      </Animated.View>
    </View>
  )
}

const LOGO_SIZE  = Math.min(W * 0.48, 220)
const RING_OUTER = LOGO_SIZE + 90
const RING_MID   = LOGO_SIZE + 48

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  glowRingOuter: {
    position:        'absolute',
    width:           RING_OUTER,
    height:          RING_OUTER,
    borderRadius:    RING_OUTER / 2,
    borderWidth:     1,
    borderColor:     '#2A5FC4',
    backgroundColor: 'transparent',
  },
  glowRingMid: {
    position:        'absolute',
    width:           RING_MID,
    height:          RING_MID,
    borderRadius:    RING_MID / 2,
    borderWidth:     1.5,
    borderColor:     'rgba(42, 95, 196, 0.35)',
    backgroundColor: 'rgba(14, 34, 80, 0.4)',
  },
  glowCore: {
    position:        'absolute',
    width:           LOGO_SIZE + 16,
    height:          LOGO_SIZE + 16,
    borderRadius:    (LOGO_SIZE + 16) / 2,
    backgroundColor: 'rgba(249, 115, 22, 0.07)',
  },

  logoShadow: {
    shadowColor:   '#F97316',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius:  32,
    elevation:     20,
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },

  wordmark: {
    fontFamily:    'Nunito_900Black',
    fontSize:      36,
    color:         '#FFFFFF',
    letterSpacing: 1.2,
    marginTop:     20,
  },

  tagRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     10,
    gap:           8,
  },
  tagWord: {
    fontFamily:    'Nunito_600SemiBold',
    fontSize:      12,
    color:         'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tagDot: {
    width:           3,
    height:          3,
    borderRadius:    2,
    backgroundColor: '#F97316',
    opacity:         0.7,
  },

  progressWrap: {
    position: 'absolute',
    bottom:   H * 0.1,
  },
  progressTrack: {
    width:           W * 0.55,
    height:          3,
    borderRadius:    2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow:        'hidden',
  },
  progressFill: {
    height:          3,
    borderRadius:    2,
    backgroundColor: '#F97316',
    shadowColor:     '#F97316',
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.8,
    shadowRadius:    6,
  },
})
