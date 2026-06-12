import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { useAuthStore } from '../../src/stores/authStore'
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '../../src/lib/theme'

interface Message {
  id:          string
  user_id:     string
  sender_name: string
  content:     string
  created_at:  string
}

const AVATAR_PALETTE = [
  '#1A3A6B', '#2563EB', '#F97316', '#10B981',
  '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4',
]

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function groupable(a: Message, b: Message) {
  if (a.user_id !== b.user_id) return false
  return Math.abs(
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) < 5 * 60 * 1000
}

type ListItem =
  | { type: 'date'; label: string; key: string }
  | { type: 'msg';  msg: Message; showHeader: boolean; key: string }

export default function ChatScreen() {
  const insets  = useSafeAreaInsets()
  const { user, profile } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    load()
    const ch = supabase
      .channel('student-group-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'student_messages' },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]),
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('student_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200)
    if (data) setMessages(data)
    setLoading(false)
  }

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = []
    for (let i = 0; i < messages.length; i++) {
      const msg  = messages[i]
      const prev = messages[i - 1]
      if (!prev || !sameDay(prev.created_at, msg.created_at)) {
        items.push({ type: 'date', label: formatDateLabel(msg.created_at), key: `d-${msg.id}` })
      }
      items.push({
        type:       'msg',
        msg,
        showHeader: !prev || !groupable(prev, msg),
        key:        msg.id,
      })
    }
    return items
  }, [messages])

  const scrollToBottom = useCallback(() => {
    if (listData.length > 0) {
      listRef.current?.scrollToEnd({ animated: false })
    }
  }, [listData.length])

  async function send() {
    const text = input.trim()
    if (!text || !user || !profile) return
    setInput('')
    setSending(true)
    await supabase.from('student_messages').insert({
      user_id:     user.id,
      sender_name: profile.name,
      content:     text,
    })
    setSending(false)
  }

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'date') {
      return (
        <View style={s.dateSep}>
          <View style={s.dateLine} />
          <Text style={s.dateLabel}>{item.label}</Text>
          <View style={s.dateLine} />
        </View>
      )
    }

    const { msg, showHeader } = item
    const isOwn  = msg.user_id === user?.id
    const color  = avatarColor(msg.sender_name)

    return (
      <View style={[s.row, !showHeader && s.rowGrouped]}>
        {showHeader ? (
          <View style={[s.avatar, { backgroundColor: color }]}>
            <Text style={s.avatarLetter}>{msg.sender_name[0].toUpperCase()}</Text>
          </View>
        ) : (
          <View style={s.avatarGap} />
        )}

        <View style={s.bubble}>
          {showHeader && (
            <View style={s.meta}>
              <Text style={[s.name, isOwn && s.nameOwn]}>{msg.sender_name}</Text>
              <Text style={s.time}>{formatTime(msg.created_at)}</Text>
            </View>
          )}
          <Text style={s.content}>{msg.content}</Text>
        </View>
      </View>
    )
  }, [user?.id])

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.hashBadge}>
            <Text style={s.hashSign}>#</Text>
          </View>
          <View>
            <Text style={s.channelName}>all-students</Text>
            <Text style={s.channelSub}>FirstBridge student community</Text>
          </View>
        </View>
        <TouchableOpacity style={s.headerAction} onPress={load}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Messages + Input ───────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 62}
      >
        {loading ? (
          <View style={s.center}>
            <Text style={s.centerTxt}>Loading…</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="chatbubbles-outline" size={52} color={Colors.border} />
            <Text style={s.emptyTitle}>No messages yet</Text>
            <Text style={s.centerTxt}>Be the first to say hello 👋</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        )}

        {/* ── Input bar ─────────────────────────────────────────────────── */}
        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Message #all-students…"
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={1000}
            onSubmitEditing={Platform.OS === 'ios' ? send : undefined}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || sending) && s.sendDisabled]}
            onPress={send}
            disabled={!input.trim() || sending}
            activeOpacity={0.75}
          >
            <Ionicons name="send" size={17} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // ── Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  hashBadge:   {
    width:           36,
    height:          36,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems:      'center',
    justifyContent:  'center',
  },
  hashSign:    { fontFamily: FontFamily.displayBold, fontSize: FontSize.lg, color: Colors.primary },
  channelName: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.textPrimary },
  channelSub:  { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  headerAction:{
    width:           36,
    height:          36,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Empty / loading states
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.lg, color: Colors.textPrimary },
  centerTxt:  { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.textSecondary },

  // ── Message list
  list: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },

  // ── Date separator
  dateSep:   { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md, gap: Spacing.sm },
  dateLine:  { flex: 1, height: 1, backgroundColor: Colors.border },
  dateLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.xs, color: Colors.textSecondary },

  // ── Message row
  row:        { flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.md },
  rowGrouped: { paddingTop: 2 },

  avatar: {
    width:          36,
    height:         36,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    marginTop:      2,
  },
  avatarLetter: { fontFamily: FontFamily.displayBold, fontSize: FontSize.sm, color: '#FFFFFF' },
  avatarGap:    { width: 36, flexShrink: 0 },

  bubble:  { flex: 1, gap: 2 },
  meta:    { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  name:    { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  nameOwn: { color: Colors.primary },
  time:    { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.textSecondary },
  content: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 21 },

  // ── Input bar
  inputBar: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    gap:               Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop:        Spacing.sm,
    backgroundColor:   Colors.surface,
    borderTopWidth:    1,
    borderTopColor:    Colors.border,
  },
  textInput: {
    flex:              1,
    minHeight:         40,
    maxHeight:         120,
    backgroundColor:   Colors.surfaceAlt,
    borderRadius:      Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    fontFamily:        FontFamily.body,
    fontSize:          FontSize.md,
    color:             Colors.textPrimary,
  },
  sendBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    0,
  },
  sendDisabled: { backgroundColor: Colors.border },
})
