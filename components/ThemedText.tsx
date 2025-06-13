import { FONTS } from '@/app/_layout';
import { StyleSheet, Text, TextProps, useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle';
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.default,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        { color: isDark ? '#fff' : '#000' },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: FONTS.jua,
    fontSize: 16,
  },
  defaultSemiBold: {
    fontFamily: FONTS.jua,
    fontSize: 16,
  },
  title: {
    fontFamily: FONTS.jua,
    fontSize: 32,
  },
  subtitle: {
    fontFamily: FONTS.jua,
    fontSize: 24,
  },
});
