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
    fontFamily: FONTS.nunito,
    fontSize: 16,
  },
  defaultSemiBold: {
    fontFamily: FONTS.nunitoBold,
    fontSize: 16,
  },
  title: {
    fontFamily: FONTS.nunitoBold,
    fontSize: 32,
  },
  subtitle: {
    fontFamily: FONTS.nunitoBold,
    fontSize: 24,
  },
});
