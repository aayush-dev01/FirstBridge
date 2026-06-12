import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window')

export default function App() {
  // Logo: scale + fade in together
  const logoOpacity = useRef(new Animated.Value(0)).current
  const logoScale   = useRef(new Animated.Value(0.75)).current

  // Wordmark + tagline fade in after logo
  const wordmarkOpacity = useRef(new Animated.Value(0)).current
  const taglineOpacity  = useRef(new Animated.Value(0)).current

  // Three loading dots
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // 1. Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue:         1,
        duration:        900,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue:         1,
        friction:        6,
        tension:         40,
        useNativeDriver: true,
      }),
    ]).start()

    // 2. Wordmark fades in
    Animated.timing(wordmarkOpacity, {
      toValue:         1,
      duration:        700,
      delay:           600,
      useNativeDriver: true,
    }).start()

    // 3. Tagline fades in
    Animated.timing(taglineOpacity, {
      toValue:         1,
      duration:        600,
      delay:           950,
      useNativeDriver: true,
    }).start()

    // 4. Dots bounce loop
    const dotBounce = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue:         -10,
            duration:        380,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue:         0,
            duration:        380,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      )

    Animated.parallel([
      dotBounce(dot1, 1400),
      dotBounce(dot2, 1600),
      dotBounce(dot3, 1800),
    ]).start()
  }, [])

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Background gradient matching the logo's dark bg */}
      <LinearGradient
        colors={['#0F1B33', '#1A2C52', '#142040']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow behind logo */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('./assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Wordmark */}
      <Animated.Text style={[styles.wordmark, { opacity: wordmarkOpacity }]}>
        FirstBridge
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Scholarship · Mentorship · Community
      </Animated.Text>

      {/* Divider */}
      <Animated.View style={[styles.divider, { opacity: taglineOpacity }]} />

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { transform: [{ translateY: anim }] },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  // Ambient glow layers behind the logo
  glowOuter: {
    position:        'absolute',
    width:           360,
    height:          360,
    borderRadius:    180,
    backgroundColor: '#1E4B9A',
    opacity:         0.18,
    top:             height * 0.5 - 220,
    alignSelf:       'center',
  },
  glowInner: {
    position:        'absolute',
    width:           220,
    height:          180,
    borderRadius:    110,
    backgroundColor: '#F97316',
    opacity:         0.09,
    top:             height * 0.5 - 140,
    alignSelf:       'center',
  },

  logoWrap: {
    marginBottom: 4,
  },
  logo: {
    width:  220,
    height: 220,
  },

  wordmark: {
    fontSize:    40,
    fontWeight:  '800',
    color:       '#1E4B9A',
    letterSpacing: 0.5,
    marginTop:   8,
  },

  tagline: {
    fontSize:      13,
    color:         '#8FAFD6',
    letterSpacing: 1.2,
    marginTop:     8,
  },

  divider: {
    width:           48,
    height:          2,
    borderRadius:    1,
    backgroundColor: '#F97316',
    marginTop:       28,
    opacity:         0.8,
  },

  dotsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    marginTop:      24,
  },
  dot: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: '#F97316',
    opacity:         0.9,
  },
})
