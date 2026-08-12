import { SandboxProvider } from './context/SandboxContext';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <SandboxProvider>
      <AppRouter />
    </SandboxProvider>
  );
}
