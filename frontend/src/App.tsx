import React from 'react';
import { SoulverseWebsiteShell } from './components/SoulverseWebsiteShell';
import { SpotifyMusicProvider } from './context/SpotifyMusicContext';

export function App() {
  return (
    <SpotifyMusicProvider>
      <SoulverseWebsiteShell />
    </SpotifyMusicProvider>
  );
}

export default App;
