import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../src/lib/theme'

export default function SchoolScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.heading}>My School</Text>
      </View>
      <View style={s.center}>
        <Ionicons name="school-outline" size={56} color={Colors.border} />
        <Text style={s.title}>School Group Chat</Text>
        <Text style={s.desc}>A dedicated space to chat with students from your own school.</Text>
        <View style={s.chip}><Text style={s.chipTxt}>Coming soon</Text></View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor:   Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heading: { fontFamily: FontFamily.displayBold, fontSize: FontSize.lg, color: Colors.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md },
  title:  { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xl, color: Colors.textPrimary, textAlign: 'center' },
  desc:   { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  chip:   { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  chipTxt:{ fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: Colors.textSecondary },
})
