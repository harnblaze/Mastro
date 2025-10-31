// Дизайн-система для Mastro
export const designSystem = {
  colors: {
    // Основные цвета
    primary: '#007AFF',
    primaryHover: '#0056CC',
    primaryLight: '#E3F2FD',
    
    // Вторичные цвета
    secondary: '#5856D6',
    secondaryHover: '#3D3BCC',
    secondaryLight: '#F3F2FF',
    
    // Статусы
    success: '#34C759',
    successLight: '#E8F5E8',
    warning: '#FF9500',
    warningLight: '#FFF4E6',
    error: '#FF3B30',
    errorLight: '#FFEBEE',
    info: '#5AC8FA',
    infoLight: '#E3F2FD',
    
    // Нейтральные цвета
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceHover: '#F5F5F5',
    border: '#E1E3E6',
    borderLight: '#F0F0F0',
    
    // Текст
    textPrimary: '#1C1C1E',
    textSecondary: '#6D7885',
    textTertiary: '#8E8E93',
    textDisabled: '#C7C7CC',
    
    // Градиенты
    gradientPrimary: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
    gradientSecondary: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    gradientWarning: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.15)',
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1a1a1a',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1a1a1a',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1a1a1a',
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#666666',
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  transitions: {
    fast: 'all 0.15s ease-in-out',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out',
  },
  
  zIndex: {
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    notification: 800,
  },
};

// Утилиты для стилей
export const createStyles = (styles: Record<string, any>) => styles;

// Компоненты стилей
export const commonStyles = {
  card: {
    backgroundColor: designSystem.colors.surface,
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.md,
    padding: designSystem.spacing.lg,
    border: `1px solid ${designSystem.colors.borderLight}`,
  },
  
  cardHover: {
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: designSystem.shadows.lg,
      transform: 'translateY(-2px)',
    },
  },
  
  buttonPrimary: {
    background: designSystem.colors.gradientPrimary,
    color: 'white',
    border: 'none',
    borderRadius: designSystem.borderRadius.md,
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    fontWeight: designSystem.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: designSystem.shadows.md,
    },
  },
  
  buttonSecondary: {
    backgroundColor: designSystem.colors.surface,
    color: designSystem.colors.textPrimary,
    border: `1px solid ${designSystem.colors.border}`,
    borderRadius: designSystem.borderRadius.md,
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    fontWeight: designSystem.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: designSystem.colors.surfaceHover,
      borderColor: designSystem.colors.primary,
    },
  },
  
  input: {
    width: '100%',
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    border: `1px solid ${designSystem.colors.border}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.fontSize.md,
    fontFamily: designSystem.typography.fontFamily,
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: designSystem.colors.primary,
      boxShadow: `0 0 0 3px ${designSystem.colors.primaryLight}`,
    },
  },
  
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
    borderRadius: designSystem.borderRadius.full,
    fontSize: designSystem.typography.fontSize.xs,
    fontWeight: designSystem.typography.fontWeight.medium,
  },
  
  badgeSuccess: {
    backgroundColor: designSystem.colors.successLight,
    color: designSystem.colors.success,
  },
  
  badgeWarning: {
    backgroundColor: designSystem.colors.warningLight,
    color: designSystem.colors.warning,
  },
  
  badgeError: {
    backgroundColor: designSystem.colors.errorLight,
    color: designSystem.colors.error,
  },
  
  badgeInfo: {
    backgroundColor: designSystem.colors.infoLight,
    color: designSystem.colors.info,
  },
  
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: designSystem.colors.background,
    padding: 0,
    gap: designSystem.spacing.lg,
    maxWidth: '1080px',
    margin: '0 auto',
    width: '100%',
    '@media (max-width: 768px)': {
      padding: 0,
      gap: designSystem.spacing.md,
    },
  },
  
  pageHeader: {
    marginBottom: designSystem.spacing.xl,
    paddingBottom: designSystem.spacing.lg,
    borderBottom: `1px solid ${designSystem.colors.borderLight}`,
  },
  
  pageTitle: {
    fontSize: designSystem.typography.fontSize.xxxl,
    fontWeight: designSystem.typography.fontWeight.bold,
    color: designSystem.colors.textPrimary,
    margin: 0,
  },
  
  pageSubtitle: {
    fontSize: designSystem.typography.fontSize.lg,
    color: designSystem.colors.textSecondary,
    margin: 0,
  },
  
  grid: {
    display: 'grid',
    gap: designSystem.spacing.lg,
  },
  
  gridCols1: {
    gridTemplateColumns: '1fr',
  },
  
  gridCols2: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  
  gridCols3: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  
  gridCols4: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  flexStart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  flexEnd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  
  textCenter: {
    textAlign: 'center' as const,
  },
  
  textLeft: {
    textAlign: 'left' as const,
  },
  
  textRight: {
    textAlign: 'right' as const,
  },
  
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: designSystem.spacing.xxl,
    color: designSystem.colors.textSecondary,
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: designSystem.spacing.xxl,
    textAlign: 'center' as const,
    color: designSystem.colors.textSecondary,
  },
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: designSystem.spacing.xxl,
    textAlign: 'center' as const,
    color: designSystem.colors.textPrimary,
  },
  
  errorIcon: {
    fontSize: designSystem.typography.fontSize.xxxl,
    marginBottom: designSystem.spacing.lg,
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${designSystem.colors.borderLight}`,
    borderTop: `4px solid ${designSystem.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  errorState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: designSystem.spacing.xxl,
    textAlign: 'center' as const,
    color: designSystem.colors.error,
  },

  // Мобильные стили
  mobileOnly: {
    '@media (min-width: 769px)': {
      display: 'none',
    },
  },

  desktopOnly: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },

  mobileStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: designSystem.spacing.md,
    '@media (min-width: 769px)': {
      flexDirection: 'row' as const,
      alignItems: 'center',
    },
  },

  mobileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: designSystem.spacing.md,
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },

  mobileCardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: designSystem.spacing.md,
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 10244px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },

  mobileHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: designSystem.spacing.md,
    '@media (min-width: 768px)': {
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },

  mobileButtonGroup: {
    display: 'flex',
    justifyContent: 'center' as const,
    gap: designSystem.spacing.lg,
    '@media (min-width: 640px)': {
      flexDirection: 'row' as const,
      width: 'auto',
      gap: designSystem.spacing.md,
    },
  },
};

// CSS анимации
const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Добавляем стили в head если их еще нет
if (typeof document !== 'undefined' && !document.getElementById('design-system-styles')) {
  const style = document.createElement('style');
  style.id = 'design-system-styles';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

export default designSystem;
