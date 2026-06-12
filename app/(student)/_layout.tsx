import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { ColorValue } from 'react-native'
import { Colors, FontFamily } from '../../src/lib/theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

function TabIcon(outline: IconName, filled: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} size={23} color={color as string} />
  )
}

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: FontFamily.bodySemiBold,
          fontSize: 10,
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: TabIcon('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: TabIcon('chatbubbles-outline', 'chatbubbles'),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: TabIcon('document-text-outline', 'document-text'),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: TabIcon('calendar-outline', 'calendar'),
        }}
      />
      <Tabs.Screen
        name="school"
        options={{
          title: 'School',
          tabBarIcon: TabIcon('school-outline', 'school'),
        }}
      />
    </Tabs>
  )
}
