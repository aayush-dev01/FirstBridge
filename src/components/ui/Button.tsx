import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Colors, FontFamily, FontSize, Radius } from '../../lib/theme'

// Google G SVG
import Svg, { Path } from 'react-native-svg'

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  )
}

type Variant = 'primary' | 'accent' | 'google' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label:      string
  onPress?:   () => void
  loading?:   boolean
  disabled?:  boolean
  fullWidth?: boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  variant?:   Variant
  size?:      Size
}

const HEIGHT:    Record<Size, number> = { sm: 44, md: 52, lg: 58 }
const FONT_SIZE: Record<Size, number> = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg }

const BG: Record<Variant, string> = {
  primary: Colors.primary,
  accent:  Colors.accent,
  google:  Colors.surface,
  ghost:   'transparent',
  danger:  Colors.error,
}
const TEXT_COLOR: Record<Variant, string> = {
  primary: Colors.textInverse,
  accent:  Colors.textInverse,
  google:  '#374151',
  ghost:   Colors.primary,
  danger:  Colors.textInverse,
}

export function Button({
  label,
  onPress,
  loading    = false,
  disabled   = false,
  fullWidth  = false,
  leftIcon,
  rightIcon,
  variant    = 'primary',
  size       = 'md',
}: ButtonProps) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn  = () => { scale.value = withSpring(0.96, { damping: 20, stiffness: 500 }) }
  const handlePressOut = () => { scale.value = withSpring(1.00, { damping: 20, stiffness: 500 }) }

  const isDisabled = disabled || loading
  const isGoogle   = variant === 'google'
  const isGhost    = variant === 'ghost'

  return (
    <Animated.View style={[animStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[
          s.base,
          { height: HEIGHT[size], backgroundColor: BG[variant] },
          isGhost  && s.ghost,
          isGoogle && s.googleBorder,
          isDisabled && s.disabled,
          fullWidth && s.full,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={TEXT_COLOR[variant]} size="small" />
        ) : (
          <View style={s.inner}>
            {isGoogle  && <View style={s.iconWrap}><GoogleLogo /></View>}
            {!isGoogle && leftIcon && <View style={s.iconWrap}>{leftIcon}</View>}
            <Text style={[s.label, { fontSize: FONT_SIZE[size], color: TEXT_COLOR[variant] }]}>
              {label}
            </Text>
            {rightIcon && <View style={s.iconWrap}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  base: {
    borderRadius:   Radius.md,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  inner: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    letterSpacing: 0.2,
  },
  iconWrap: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  googleBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    opacity: 0.45,
  },
  full: {
    width: '100%',
  },
})
