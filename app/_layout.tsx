import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar }       from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider }from 'react-native-safe-area-context'
import * as SplashScreen   from 'expo-splash-screen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { useAuthStore }   from '../src/stores/authStore'
import { getSession, loadProfile, onAuthStateChange } from '../src/services/auth.service'
import { ROLE_ROUTES }    from '../src/lib/theme'
import { Colors }         from '../src/lib/theme'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
})

function AuthGate() {
  const router   = useRouter()
  const segments = useSegments()
  const { isAuthenticated, profile, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) return  // wait for getSession() to finish before navigating

    const seg0     = segments[0] as string
    const inAuth   = seg0 === '(auth)'
    const inPublic = seg0 === '(public)'

    if (isAuthenticated && profile?.onboardingComplete) {
      if (inAuth) router.replace(ROLE_ROUTES[profile.role] as never)
    } else if (isAuthenticated && !profile?.onboardingComplete) {
      if (!inAuth) router.replace('/(auth)/signup')
    } else if (!isAuthenticated) {
      if (!inAuth && !inPublic) router.replace('/(auth)/welcome')
    }
  }, [isAuthenticated, profile, segments, isLoading])

  return null
}

export default function RootLayout() {
  const { setUser, setProfile, setLoading } = useAuthStore()

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const session = await getSession()
        if (session?.user) {
          setUser(session.user)
          const profile = await loadProfile(session.user.id)
          if (profile) setProfile(profile)
        }
      } finally {
        setLoading(false)
      }
    }
    init()

    const { data: listener } = onAuthStateChange(async (event, user) => {
      if (user) {
        setUser(user)
        const profile = await loadProfile(user.id)
        if (profile) setProfile(profile)
      } else {
        useAuthStore.getState().clearAuth()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <AuthGate />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
