import 'react-native-url-polyfill/auto';
import { AuthProvider } from './app/context/AuthContext';
import Navigation from './app/navigation';
import './global.css';

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
