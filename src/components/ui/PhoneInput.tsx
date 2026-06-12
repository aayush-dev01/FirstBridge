import { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../lib/theme'

interface PhoneInputProps {
  value:       string
  onChange:    (raw: string, e164: string, valid: boolean) => void
  error?:      string
  editable?:   boolean
  autoFocus?:  boolean
}

const COUNTRY = { flag: '🇮🇳', code: '+91', digits: 10 }

function format(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, COUNTRY.digits)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)} ${d.slice(5)}`
}

export function PhoneInput({ value, onChange, error, editable = true, autoFocus }: PhoneInputProps) {
  const [focused, setFocused] = useState(false)
  const raw = value.replace(/\D/g, '').slice(0, COUNTRY.digits)

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, COUNTRY.digits)
    const e164   = `${COUNTRY.code}${digits}`
    const valid  = digits.length === COUNTRY.digits
    onChange(digits, e164, valid)
  }

  const borderColor = error ? Colors.error : focused ? Colors.primaryMid : Colors.border

  return (
    <View style={s.wrap}>
      <View style={[s.container, { borderColor }]}>
        {/* Country code chip */}
        <TouchableOpacity style={s.countryChip} activeOpacity={0.7}>
          <Text style={s.flag}>{COUNTRY.flag}</Text>
          <Text style={s.code}>{COUNTRY.code}</Text>
          <Text style={s.chevron}>▾</Text>
        </TouchableOpacity>

        <View style={s.sep} />

        <TextInput
          style={s.input}
          value={format(raw)}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          placeholder="98765 43210"
          placeholderTextColor={Colors.textSecondary}
          maxLength={11} // 5 + space + 5
          editable={editable}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.primaryMid}
        />

        {raw.length === COUNTRY.digits && (
          <Text style={s.tick}>✓</Text>
        )}
      </View>

      {error && <Text style={s.error}>{error}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  wrap:      { marginBottom: Spacing.md },
  container: {
    height:           56,
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.surfaceAlt,
    borderWidth:      1.5,
    borderRadius:     Radius.md,
    paddingHorizontal: Spacing.lg,
    gap:              Spacing.sm,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  flag:    { fontSize: 20 },
  code:    { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.textPrimary },
  chevron: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  sep:     { width: 1, height: 24, backgroundColor: Colors.border, marginHorizontal: 4 },
  input: {
    flex:       1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize:   FontSize.lg,
    color:      Colors.textPrimary,
    letterSpacing: 1.5,
  },
  tick:  { fontSize: 16, color: Colors.success },
  error: {
    fontFamily:  FontFamily.body,
    fontSize:    FontSize.xs,
    color:       Colors.error,
    marginTop:   4,
    marginLeft:  Spacing.lg,
  },
})
