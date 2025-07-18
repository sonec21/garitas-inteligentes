export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    notification: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    shadow: string;
    overlay: string;
    tabBar: string;
    tabBarActive: string;
    tabBarInactive: string;
    statusBar: 'light-content' | 'dark-content';
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    weights: {
      regular: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    notification: '#FF3B30',
    accent: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.4)',
    tabBar: '#FFFFFF',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',
    statusBar: 'dark-content',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#8E8E93',
    border: '#38383A',
    notification: '#FF453A',
    accent: '#0A84FF',
    success: '#32D74B',
    warning: '#FF9F0A',
    error: '#FF453A',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
    tabBar: '#1C1C1E',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#8E8E93',
    statusBar: 'light-content',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};