import { memo } from 'react';
import { Spinner, Div } from '@vkontakte/vkui';

// Константы для стилей
const LOADING_STYLES = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
} as const;

export const LoadingScreen = memo(() => {
  return (
    <Div style={LOADING_STYLES.container}>
      <Spinner size="l" />
    </Div>
  );
});
