import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg'
import { Colors, FontFamily, FontSize } from '../../lib/theme'

const { width: W } = Dimensions.get('window')

// ─── Bridge + graduation cap SVG ─────────────────────────────────────────────
function BridgeLogo({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Defs>
        <SvgGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="1" stopColor="#C7D8F8" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FBBF24" stopOpacity="1" />
          <Stop offset="1" stopColor="#F97316" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F97316" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#EA580C" stopOpacity="0.6" />
        </SvgGradient>
      </Defs>

      {/* Outer circle ring */}
      <Circle cx="36" cy="36" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />

      {/* Bridge arch body */}
      <Path
        d="M10 46 Q36 22 62 46"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Bridge deck */}
      <Rect x="8" y="44" width="56" height="5" rx="2.5" fill="rgba(255,255,255,0.85)" />
      {/* Left pillar */}
      <Rect x="14" y="44" width="5" height="12" rx="1.5" fill="rgba(255,255,255,0.7)" />
      {/* Right pillar */}
      <Rect x="53" y="44" width="5" height="12" rx="1.5" fill="rgba(255,255,255,0.7)" />
      {/* Bridge arch arches */}
      <Path d="M18 49 Q24 44 30 49" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      <Path d="M42 49 Q48 44 54 49" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />

      {/* Sun / sunrise */}
      <Circle cx="36" cy="36" r="7" fill="url(#sunGrad)" />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad   = (angle * Math.PI) / 180
        const x1    = 36 + 9  * Math.cos(rad)
        const y1    = 36 + 9  * Math.sin(rad)
        const x2    = 36 + 13 * Math.cos(rad)
        const y2    = 36 + 13 * Math.sin(rad)
        return (
          <Path
            key={i}
            d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
            stroke="#FBBF24"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      })}

      {/* Road/path leading to bridge */}
      <Path
        d="M20 62 Q36 50 52 62"
        stroke="url(#roadGrad)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Graduation cap */}
      <Path
        d="M24 20 L36 14 L48 20 L36 26 Z"
        fill="url(#capGrad)"
      />
      <Path
        d="M42 22 L42 30 Q36 33 30 30 L30 22"
        fill="rgba(255,255,255,0.7)"
      />
      {/* Tassel */}
      <Path
        d="M48 20 L48 26 L46 30"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="46" cy="31" r="2" fill="#FBBF24" />
    </Svg>
  )
}

// ─── Wave SVG cutout ──────────────────────────────────────────────────────────
function BottomWave() {
  return (
    <View style={s.waveWrap} pointerEvents="none">
      <Svg width={W} height={36} viewBox={`0 0 ${W} 36`} preserveAspectRatio="none">
        <Path
          d={`M0 0 C${W * 0.25} 36 ${W * 0.75} 0 ${W} 36 L${W} 36 L0 36 Z`}
          fill={Colors.surface}
        />
      </Svg>
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
interface HeroHeaderProps {
  height?:   number
  title?:    string
  subtitle?: string
}

export function HeroHeader({
  height   = Dimensions.get('window').height * 0.38,
  title    = 'FirstBridge',
  subtitle,
}: HeroHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.root, { height }]}>
      <LinearGradient
        colors={['#0F2557', '#1A3A6B', '#2563EB']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs */}
      <View style={s.blobTR} />
      <View style={s.blobBL} />

      {/* Content */}
      <View style={[s.content, { paddingTop: insets.top + 20 }]}>
        <BridgeLogo size={72} />
        <Text style={s.wordmark}>{title}</Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>

      <BottomWave />
    </View>
  )
}

const s = StyleSheet.create({
  root:     { overflow: 'hidden', justifyContent: 'flex-end' },
  content: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingBottom:  28,
  },
  wordmark: {
    fontFamily:    FontFamily.displayBlack,
    fontSize:      FontSize.xxl,
    color:         Colors.textInverse,
    letterSpacing: 0.8,
    marginTop:     10,
  },
  subtitle: {
    fontFamily:    FontFamily.body,
    fontSize:      FontSize.sm,
    color:         'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    marginTop:     6,
  },
  blobTR: {
    position:        'absolute',
    top:             -50,
    right:           -50,
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobBL: {
    position:        'absolute',
    bottom:          20,
    left:            -40,
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  waveWrap: {
    position: 'absolute',
    bottom:   -1,
    left:     0,
    right:    0,
  },
})
