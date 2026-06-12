import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '../../lib/theme'
import { ROLE_META } from '../../lib/theme'
import type { UserRole } from '../../types/auth.types'

interface RoleCardProps {
  role:       UserRole
  selected:   boolean
  onSelect:   (role: UserRole) => void
}

export function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const meta  = ROLE_META[role]
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn  = () => { scale.value = withSpring(0.96, { damping: 15 }) }
  const handlePressOut = () => { scale.value = withSpring(1.00, { damping: 15 }) }

  return (
    <Animated.View style={[s.wrap, animStyle]}>
      <TouchableOpacity
        onPress={() => onSelect(role)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          s.card,
          selected && { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.surfaceAlt },
        ]}
        accessibilityLabel={`Select role: ${meta.label}`}
        accessibilityState={{ selected }}
      >
        {/* Selected checkmark */}
        {selected && (
          <View style={s.check}>
            <Ionicons name="checkmark" size={12} color={Colors.textInverse} />
          </View>
        )}

        {/* Icon circle */}
        <View style={[s.iconCircle, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon as never} size={20} color={meta.textColor} />
        </View>

        <Text style={s.label} numberOfLines={1}>{meta.label}</Text>
        <Text style={s.desc}  numberOfLines={2}>{meta.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrap: { width: '48%' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    minHeight:       110,
    position:        'relative',
    ...Shadow.sm,
  },
  check: {
    position:        'absolute',
    top:             Spacing.sm,
    right:           Spacing.sm,
    width:           22,
    height:          22,
    borderRadius:    11,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  iconCircle: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   Spacing.sm,
  },
  label: {
    fontFamily:   FontFamily.bodySemiBold,
    fontSize:     FontSize.sm,
    color:        Colors.textPrimary,
    marginBottom: 3,
  },
  desc: {
    fontFamily: FontFamily.body,
    fontSize:   FontSize.xs,
    color:      Colors.textSecondary,
    lineHeight: 16,
  },
})
