import { Platform, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Handle the collapsable warning on web by ensuring proper boolean handling
  const viewProps = Platform.OS === 'web' 
    ? { 
        ...otherProps,
        // Remove any collapsable prop that might be passed through
        collapsable: undefined
      }
    : otherProps;

  return <View style={[{ backgroundColor }, style]} {...viewProps} />;
}
