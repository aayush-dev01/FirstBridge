import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../src/lib/theme'
import { logout } from '../../src/services/auth.service'
import { useAuthStore } from '../../src/stores/authStore'

export default function MentorDashboard() {
  const router = useRouter()
  const { profile, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    clearAuth()
    router.replace('/(auth)/welcome')
  }

  return (
    <View style={s.root}>
      <Text style={s.emoji}>🧑‍🏫</Text>
      <Text style={s.title}>Welcome, {profile?.name ?? 'Mentor'}</Text>
      <Text style={s.sub}>Mentor Dashboard</Text>
      <Text style={s.coming}>Connect with students and scholars — coming soon</Text>
      <TouchableOpacity style={s.btn} onPress={handleLogout}>
        <Text style={s.btnTxt}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emoji:  { fontSize: 48, marginBottom: Spacing.md },
  title:  { fontFamily: FontFamily.displayBold, fontSize: FontSize.xxl, color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  sub:    { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.primary, marginBottom: Spacing.sm },
  coming: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xxxl, textAlign: 'center' },
  btn:    { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md },
  btnTxt: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.textInverse },
})
