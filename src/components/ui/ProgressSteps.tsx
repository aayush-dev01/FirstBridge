import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../lib/theme'

interface ProgressStepsProps {
  total:   number
  current: number
  labels?: string[]
}

export function ProgressSteps({ total, current, labels }: ProgressStepsProps) {
  return (
    <View style={s.row}>
      {Array.from({ length: total }).map((_, i) => {
        const done   = i < current
        const active = i === current

        return (
          <View key={i} style={s.stepWrap}>
            <StepPill done={done} active={active} />
            {labels?.[i] && (
              <Text style={[s.stepLbl, (done || active) && s.stepLblOn]}>
                {labels[i]}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

function StepPill({ done, active }: { done: boolean; active: boolean }) {
  const widthAnim = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      done   ? Colors.primary
      : active ? Colors.primaryMid
      : Colors.border,
      { duration: 300 },
    ),
  }))

  return (
    <View style={s.track}>
      <Animated.View style={[s.fill, widthAnim]} />
    </View>
  )
}

const s = StyleSheet.create({
  row:       { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  stepWrap:  { flex: 1, alignItems: 'center', gap: 6 },
  track: {
    width:           '100%',
    height:          4,
    borderRadius:    Radius.full,
    backgroundColor: Colors.border,
    overflow:        'hidden',
  },
  fill: {
    flex:         1,
    height:       4,
    borderRadius: Radius.full,
  },
  stepLbl:    { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textSecondary },
  stepLblOn:  { color: Colors.primary, fontFamily: FontFamily.bodySemiBold },
})
