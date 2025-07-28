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
    disabled: string;
    gradient: {
      primary: string[];
      secondary: string[];
    };
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
    primary: '#4A9EFF',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    notification: '#FF6B6B',
    accent: '#4A9EFF',
    success: '#4ECDC4',
    warning: '#FFD93D',
    error: '#FF6B6B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.4)',
    tabBar: '#FFFFFF',
    tabBarActive: '#4A9EFF',
    tabBarInactive: '#8E8E93',
    statusBar: 'dark-content',
    disabled: '#D1D5DB',
    gradient: {
      primary: ['#4A9EFF', '#6BB6FF'],
      secondary: ['#1A1A1A', '#2A2A2A'],
    },
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
    primary: '#4A9EFF',
    background: '#0F0F0F',
    surface: '#1A1A1A',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#A6A6A6',
    textTertiary: '#666666',
    border: '#2A2A2A',
    notification: '#FF6B6B',
    accent: '#4A9EFF',
    success: '#4ECDC4',
    warning: '#FFD93D',
    error: '#FF6B6B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.8)',
    tabBar: '#0F0F0F',
    tabBarActive: '#4A9EFF',
    tabBarInactive: '#666666',
    statusBar: 'light-content',
    disabled: '#3A3A3A',
    gradient: {
      primary: ['#4A9EFF', '#6BB6FF'],
      secondary: ['#1E1E1E', '#2A2A2A'],
    },
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