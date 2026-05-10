import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { ActionConfirmProvider } from './components/ui/ActionConfirm';
import AuthLoader from './components/layout/AuthLoader';
import AppRoutes from './routes/AppRoutes';
import AIAssistant from './components/ui/AIAssistant';

function App() {
  return (
    <ToastProvider>
      <ActionConfirmProvider>
        <BrowserRouter>
          <AuthLoader>
            <AppRoutes />
          </AuthLoader>
          <AIAssistant />
        </BrowserRouter>
      </ActionConfirmProvider>
    </ToastProvider>
  );
}

export default App;
