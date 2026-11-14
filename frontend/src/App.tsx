import React from 'react';
import { SoulverseWebsiteShell } from './components/SoulverseWebsiteShell';
import { SpotifyMusicProvider } from './context/SpotifyMusicContext';
import { ToastProvider } from './components/ui/Toast';

export function App() {
  return (
    <SpotifyMusicProvider>
      <ToastProvider>
        <SoulverseWebsiteShell />
      </ToastProvider>
    </SpotifyMusicProvider>
  );
}

export default App;
