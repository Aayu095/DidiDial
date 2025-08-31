// Enhanced theme with warm beige + soft brown palette for educational women-centric app
export const COLORS = {
  // Primary palette - warm medium brown
  primary: {
    50: '#F7F3EF',
    100: '#EDE4D8',
    200: '#DBC8B5',
    300: '#C9AC92',
    400: '#B7906F',
    500: '#A67C52', // Main warm medium brown
    600: '#956F4A',
    700: '#7A5A3C',
    800: '#5F462E',
    900: '#443220',
  },
  
  // Secondary - light beige (accent color)
  secondary: {
    50: '#FDFBF7',
    100: '#F9F5EF',
    200: '#F3EDE3',
    300: '#EDE5D7',
    400: '#E7DDCB',
    500: '#E6D5C3', // Light beige (accent)
    600: '#D4C2A8',
    700: '#C2AF8D',
    800: '#B09C72',
    900: '#9E8957',
  },
  
  // Accent - same as secondary for consistency
  accent: {
    50: '#FDFBF7',
    100: '#F9F5EF',
    200: '#F3EDE3',
    300: '#EDE5D7',
    400: '#E7DDCB',
    500: '#E6D5C3', // Light beige (accent)
    600: '#D4C2A8',
    700: '#C2AF8D',
    800: '#B09C72',
    900: '#9E8957',
  },
  
  // Background
  background: {
    primary: '#FDFBF7', // Off-white cream
    secondary: '#FFFFFF',
    card: '#FFFFFF',
    surface: '#F9F5EF',
  },
  
  // Text colors
  text: {
    primary: '#3E2C23', // Dark coffee brown
    secondary: '#6B4E37', // Medium coffee brown
    tertiary: '#8B6F47',
    inverse: '#FDFBF7',
  },
  
  // Neutral colors
  neutral: {
    white: '#FDFBF7',
    black: '#3E2C23',
    gray: {
      50: '#FDFBF7',
      100: '#F9F5EF',
      200: '#F3EDE3',
      300: '#E6D5C3',
      400: '#D4B896',
      500: '#A67C52',
      600: '#8B6F47',
      700: '#6B4E37',
      800: '#4A3528',
      900: '#3E2C23',
    }
  },
  
  // Status colors
  status: {
    success: '#8B7355',
    warning: '#D4A574',
    error: '#C44536',
    info: '#7A6B5D',
  },
  
  // UI specific
  border: '#E6D5C3',
  shadow: 'rgba(62, 44, 35, 0.1)',
  overlay: 'rgba(62, 44, 35, 0.5)',
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // Add custom fonts for Hindi/Devanagari support
    hindi: 'System', // Will be replaced with proper Hindi font
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  }
};

// Cultural patterns and decorative elements
export const PATTERNS = {
  mandala: '🪷',
  lotus: '🪷',
  diya: '🪔',
  flower: '🌸',
  star: '⭐',
  heart: '💖',
  sparkle: '✨',
  celebration: '🎉',
};

// Motivational messages in Hindi/English
export const MOTIVATIONAL_MESSAGES = [
  'आप बहुत अच्छा कर रही हैं! 🌟',
  'शाबाश! आगे बढ़ते रहिए! 💪',
  'You are doing amazing! 🎉',
  'हर दिन कुछ नया सीखना बहुत अच्छी बात है! 📚',
  'आपकी मेहनत रंग लाएगी! 🌈',
  'Keep learning, keep growing! 🌱',
  'आप एक सुपरस्टार हैं! ⭐',
  'Knowledge is power! 💡',
];

// Festival greetings
export const FESTIVAL_GREETINGS = {
  diwali: 'दिवाली की शुभकामनाएं! 🪔✨',
  holi: 'होली की बधाई! 🌈🎨',
  dussehra: 'दशहरा की शुभकामनाएं! 🏹',
  karva_chauth: 'करवा चौथ की शुभकामनाएं! 🌙',
  raksha_bandhan: 'रक्षा बंधन की शुभकामनाएं! 👫',
  navratri: 'नवरात्रि की शुभकामनाएं! 💃',
};

// Create a unified theme object for easier access
export const theme = {
  colors: {
    primary: COLORS.primary[500],
    secondary: COLORS.secondary[500],
    accent: COLORS.accent[500],
    background: COLORS.background.primary,
    surface: COLORS.background.surface,
    text: COLORS.text.primary,
    textSecondary: COLORS.text.secondary,
    border: COLORS.border,
    shadow: COLORS.shadow,
    success: COLORS.status.success,
    warning: COLORS.status.warning,
    error: COLORS.status.error,
    info: COLORS.status.info,
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  PATTERNS,
  MOTIVATIONAL_MESSAGES,
  FESTIVAL_GREETINGS,
  theme,
};
