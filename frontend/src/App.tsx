import { ConfigProvider, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { AppRouter } from './components/AppRouter';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}

export default App;