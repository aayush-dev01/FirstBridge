/**
 * Supabase client with ExpoSecureStore session persistence.
 *
 * SETUP CHECKLIST:
 * 1. Copy .env.example → .env and fill in your project values.
 * 2. Auth → Providers → Phone → Enable, set up Twilio.
 * 3. Auth → Providers → Google → Enable, paste OAuth client credentials.
 * 4. Run supabase/auth-schema.sql in Supabase SQL Editor.
 */

import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

// SecureStore adapter — Supabase uses this to persist the session
const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:              ExpoSecureStoreAdapter,
    autoRefreshToken:     true,
    persistSession:       true,
    detectSessionInUrl:   false,
  },
})
