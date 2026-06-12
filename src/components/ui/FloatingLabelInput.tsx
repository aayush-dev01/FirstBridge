import { useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../lib/theme'

interface FloatingLabelInputProps {
  label:            string
  value:            string
  onChangeText:     (v: string) => void
  error?:           string
  leftIcon?:        React.ReactNode
  rightIcon?:       React.ReactNode
  rightIconPress?:  () => void
  secureTextEntry?: boolean
  keyboardType?:    KeyboardTypeOptions
  autoCapitalize?:  TextInputProps['autoCapitalize']
  maxLength?:       number
  editable?:        boolean
  testID?:          string
}

export function FloatingLabelInput({
  label,
  value,
  onChangeText,
  error,
  leftIcon,
  rightIcon,
  rightIconPress,
  secureTextEntry = false,
  keyboardType    = 'default',
  autoCapitalize  = 'sentences',
  maxLength,
  editable        = true,
  testID,
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false)
  const inputRef              = useRef<TextInput>(null)
  const floatAnim             = useSharedValue(value ? 1 : 0)

  const hasContent = value.length > 0

  useEffect(() => {
    floatAnim.value = withTiming(focused || hasContent ? 1 : 0, { duration: 180 })
  }, [focused, hasContent])

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -24]) },
      { scale:      interpolate(floatAnim.value, [0, 1], [1, 0.82]) },
    ],
    color: error
      ? Colors.error
      : focused
        ? Colors.primaryMid
        : Colors.textSecondary,
    transformOrigin: 'left center',
  }))

  const isActive  = focused || hasContent
  const borderClr = error ? Colors.error : focused ? Colors.primaryMid : Colors.border

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[
          s.container,
          { borderColor: borderClr },
          !editable && s.disabled,
        ]}
      >
        {leftIcon && <View style={[s.iconLeft, isActive && s.iconActive]}>{leftIcon}</View>}

        <View style={[s.fieldWrap, leftIcon ? s.fieldWithLeft : undefined]}>
          <Animated.Text style={[s.label, labelStyle]}>
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            testID={testID}
            style={s.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            editable={editable}
            selectionColor={Colors.primaryMid}
          />
        </View>

        {rightIcon && (
          <TouchableOpacity
            style={s.iconRight}
            onPress={rightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {error && <Text style={s.errorTxt}>{error}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  wrap:          { marginBottom: Spacing.md },
  container: {
    height:           52,
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.surfaceAlt,
    borderWidth:      1.5,
    borderRadius:     Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  fieldWrap:     { flex: 1, justifyContent: 'center', paddingTop: 10 },
  fieldWithLeft: { marginLeft: 8 },
  label: {
    position:      'absolute',
    fontFamily:    FontFamily.body,
    fontSize:      FontSize.md,
    pointerEvents: 'none',
    left:          0,
  },
  input: {
    fontFamily: FontFamily.bodyMedium,
    fontSize:   FontSize.md,
    color:      Colors.textPrimary,
    padding:    0,
    height:     28,
  },
  iconLeft:   { marginRight: 4 },
  iconActive: { opacity: 1 },
  iconRight:  { marginLeft: 4 },
  disabled:   { opacity: 0.55 },
  errorTxt: {
    fontFamily:  FontFamily.body,
    fontSize:    FontSize.xs,
    color:       Colors.error,
    marginTop:   4,
    marginLeft:  Spacing.lg,
  },
})
