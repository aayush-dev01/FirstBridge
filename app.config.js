// app.config.js — supports env var injection for native OAuth credentials
const IS_DEV       = process.env.APP_VARIANT === 'development'
const IS_PREV      = process.env.APP_VARIANT === 'preview'
const IOS_SCHEME   = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ?? ''

const bundleId = 'com.firstbridge.app'
const appName  = IS_DEV ? 'FirstBridge (Dev)' : IS_PREV ? 'FirstBridge (Preview)' : 'FirstBridge'

module.exports = {
  expo: {
    name:        appName,
    slug:        'firstbridge',
    scheme:      'firstbridge',
    version:     '1.0.0',
    orientation: 'portrait',
    icon:        './assets/images/logo.png',
    userInterfaceStyle: 'light',

    splash: {
      image:       './assets/images/logo.png',
      resizeMode:  'contain',
      backgroundColor: '#0F1B33',
    },

    ios: {
      supportsTablet:    true,
      bundleIdentifier:  IS_DEV  ? `${bundleId}.dev`
                       : IS_PREV ? `${bundleId}.preview`
                       : bundleId,
      ...(IOS_SCHEME ? {
        infoPlist: {
          CFBundleURLTypes: [{ CFBundleURLSchemes: [IOS_SCHEME] }],
        },
      } : {}),
    },

    android: {
      package: IS_DEV  ? `${bundleId}.dev`
              : IS_PREV ? `${bundleId}.preview`
              : bundleId,
      adaptiveIcon: {
        backgroundColor:  '#E6F4FE',
        foregroundImage:  './assets/android-icon-foreground.png',
        backgroundImage:  './assets/android-icon-background.png',
        monochromeImage:  './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },

    owner: 'aayushpatil0',

    extra: {
      eas: { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '95842ded-0f91-4015-b67b-49f1ee8e042c' },
    },

    plugins: [
      'expo-router',
      'expo-secure-store',
      // google-signin plugin only added once iosUrlScheme is configured
      ...(IOS_SCHEME
        ? [[
            '@react-native-google-signin/google-signin',
            { iosUrlScheme: IOS_SCHEME },
          ]]
        : []),
    ],

    experiments: {
      typedRoutes: true,
    },
  },
}
