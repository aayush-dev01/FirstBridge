import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../src/stores/authStore'
import { logout } from '../../src/services/auth.service'
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../src/lib/theme'

export default function HomeScreen() {
  const insets  = useSafeAreaInsets()
  const { profile, clearAuth } = useAuthStore()

  const handleSignOut = async () => {
    await logout()
    clearAuth()
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hey, {profile?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.sub}>Your FirstBridge feed</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={s.comingSoon}>
        <Ionicons name="newspaper-outline" size={56} color={Colors.border} />
        <Text style={s.title}>Posts & Experiences</Text>
        <Text style={s.desc}>
          Stories, scholarship tips, and experiences from alumni, scholars, and mentors will appear here.
        </Text>
        <View style={s.chip}>
          <Text style={s.chipTxt}>Coming soon</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting:   { fontFamily: FontFamily.displayBold, fontSize: FontSize.lg,  color: Colors.textPrimary },
  sub:        { fontFamily: FontFamily.body,        fontSize: FontSize.xs,  color: Colors.textSecondary, marginTop: 2 },
  signOutBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: Colors.surfaceAlt,
    alignItems:      'center',
    justifyContent:  'center',
  },
  comingSoon: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap:            Spacing.md,
  },
  title: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xl, color: Colors.textPrimary, textAlign: 'center' },
  desc:  { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  chip:  {
    backgroundColor:   Colors.surfaceAlt,
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  chipTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: Colors.textSecondary },
})
