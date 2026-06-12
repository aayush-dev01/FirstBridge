import { useEffect, useRef, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import { Colors, Radius } from '../../lib/theme'

const OTP_LENGTH = 6

interface OTPInputProps {
  onComplete: (code: string) => void
  disabled?:  boolean
}

interface BoxProps {
  digit:    string
  index:    number
  disabled: boolean
  onChangeText: (text: string, idx: number) => void
  onKeyPress:   (e: { nativeEvent: { key: string } }, idx: number) => void
  inputRef: (ref: TextInput | null) => void
}

// Each digit box is its own component so useSharedValue/useAnimatedStyle
// are called at the top level of a component, not inside a loop.
function OTPBox({ digit, index, disabled, onChangeText, onKeyPress, inputRef }: BoxProps) {
  const scale    = useSharedValue(1)
  const prevRef  = useRef('')

  useEffect(() => {
    if (digit && !prevRef.current) {
      scale.value = withSequence(
        withSpring(1.14, { damping: 6,  stiffness: 400 }),
        withSpring(1.00, { damping: 10, stiffness: 300 }),
      )
    }
    prevRef.current = digit
  }, [digit])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[s.boxWrap, animStyle]}>
      <TextInput
        ref={inputRef}
        style={[s.box, digit.length > 0 && s.boxFilled]}
        value={digit}
        onChangeText={(t) => onChangeText(t, index)}
        onKeyPress={(e) => onKeyPress(e, index)}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        editable={!disabled}
        selectTextOnFocus
        textContentType="oneTimeCode"
        selectionColor={Colors.primaryMid}
      />
    </Animated.View>
  )
}

export function OTPInput({ onComplete, disabled = false }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const inputs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null))

  const handleChange = (text: string, idx: number) => {
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, OTP_LENGTH)
      const next   = Array(OTP_LENGTH).fill('').map((_, i) => pasted[i] ?? '')
      setDigits(next)
      inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
      if (pasted.length === OTP_LENGTH) onComplete(pasted)
      return
    }

    const char = text.replace(/\D/g, '')
    const next = [...digits]
    next[idx]  = char
    setDigits(next)

    if (char && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()

    const joined = next.join('')
    if (joined.length === OTP_LENGTH) onComplete(joined)
  }

  const handleKeyPress = (e: { nativeEvent: { key: string } }, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[idx] && idx > 0) {
      const next = [...digits]
      next[idx - 1] = ''
      setDigits(next)
      inputs.current[idx - 1]?.focus()
    }
  }

  return (
    <View style={s.row}>
      {digits.map((digit, i) => (
        <OTPBox
          key={i}
          digit={digit}
          index={i}
          disabled={disabled}
          onChangeText={handleChange}
          onKeyPress={handleKeyPress}
          inputRef={(r) => { inputs.current[i] = r }}
        />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:            8,
  },
  boxWrap: { flex: 1 },
  box: {
    height:          60,
    borderRadius:    Radius.md,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    backgroundColor: Colors.surfaceAlt,
    textAlign:       'center',
    fontSize:        24,
    fontFamily:      'Nunito_700Bold',
    color:           Colors.textPrimary,
  },
  boxFilled: {
    borderColor: Colors.primary,
  },
})
