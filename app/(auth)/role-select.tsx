import { useEffect, useState } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated'
import { useRouter }   from 'expo-router'
import { Ionicons }    from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeroHeader }  from '../../src/components/auth/HeroHeader'
import { Button }      from '../../src/components/ui/Button'
import { RoleCard }    from '../../src/components/ui/RoleCard'
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '../../src/lib/theme'
import { ROLE_ROUTES } from '../../src/lib/theme'
import { updateRole }  from '../../src/services/auth.service'
import { useAuthStore }from '../../src/stores/authStore'
import type { UserRole } from '../../src/types/auth.types'

const { height: H } = Dimensions.get('window')

const ALL_ROLES: UserRole[] = [
  'student', 'scholar', 'mentor', 'staff',
  'alumni',  'donor',   'parent', 'school_rep', 'visitor',
]

export default function RoleSelectScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { user, profile, setProfile } = useAuthStore()

  const [selected, setSelected] = useState<UserRole | null>(profile?.role ?? null)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const cardY = useSharedValue(200)
  const cardO = useSharedValue(0)

  useEffect(() => {
    cardY.value = withDelay(80, withSpring(0, { damping: 22, stiffness: 180 }))
    cardO.value = withDelay(80, withSpring(1, { damping: 22, stiffness: 180 }))
  }, [])

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity:   cardO.value,
  }))

  const handleSave = async () => {
    if (!selected || !user) return
    setError(null)
    setSaving(true)

    const { error: updateErr } = await updateRole(user.id, selected)
    setSaving(false)

    if (updateErr) { setError(updateErr); return }

    if (profile) setProfile({ ...profile, role: selected })
    router.replace(ROLE_ROUTES[selected] as never)
  }

  return (
    <View style={s.root}>
      <HeroHeader height={H * 0.30} subtitle="Update your role" />

      <Animated.View style={[s.card, { paddingBottom: insets.bottom + 24 }, cardStyle]}>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={s.title}>What's your role?</Text>
          <Text style={s.sub}>You can change this at any time from your profile</Text>

          {error && (
            <View style={s.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={s.errorTxt}>{error}</Text>
            </View>
          )}

          <View style={s.grid}>
            {ALL_ROLES.map((role) => (
              <RoleCard
                key={role}
                role={role}
                selected={selected === role}
                onSelect={setSelected}
              />
            ))}
          </View>

          <Button
            variant="accent"
            size="lg"
            label={saving ? 'Saving…' : 'Save & Continue →'}
            fullWidth
            loading={saving}
            disabled={!selected}
            onPress={handleSave}
          />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  card: {
    flex:                 1,
    backgroundColor:      Colors.surface,
    borderTopLeftRadius:  Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    marginTop:            -Radius.xxl,
    ...Shadow.lg,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop:        Spacing.xl,
    paddingBottom:     Spacing.xxxl,
    gap:               Spacing.md,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.surfaceAlt,
    alignItems:      'center',
    justifyContent:  'center',
    alignSelf:       'flex-start',
  },
  title: { fontFamily: FontFamily.displayBold, fontSize: FontSize.xl,  color: Colors.textPrimary },
  sub:   { fontFamily: FontFamily.body,        fontSize: FontSize.sm,  color: Colors.textSecondary },
  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  errorBanner: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   '#FEF2F2',
    borderRadius:      Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    borderWidth:       1,
    borderColor:       '#FECACA',
  },
  errorTxt: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.error },
})
