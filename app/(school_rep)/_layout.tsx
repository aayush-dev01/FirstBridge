import { Stack } from 'expo-router'
import { Colors } from '../../src/lib/theme'

export default function SchoolRepLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
}
