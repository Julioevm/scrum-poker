import { FunctionalComponent, h } from 'preact';
import { Route, Router } from 'preact-router';

import Home from '../routes/home/home';
import Room from '../routes/room/room';
import NotFoundPage from '../routes/notfound/notFound';
import Header from './header/header';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { Socket } from 'socket.io-client';
import { getDefaultTheme } from 'Utils/utils';

export interface Player {
  id: string;
  name: string;
  vote: string | undefined;
}
interface StateStore {
  socket: Socket | null;
  player: Player;
  room: string | undefined;
  theme: string;
}

export const stateStore = create<StateStore>()(
  persist(
    (set) => ({
      socket: null,
      player: { id: '0', name: 'Guest', vote: undefined },
      room: undefined,
      theme: getDefaultTheme(),
    }),
    {
      name: 'scrum-poker-session',
      getStorage: () => sessionStorage,
      partialize: (state) => ({ player: state.player }),
    }
  )
);

export const themeStore = create<{ theme: string }>()(
  persist(
    (set) => ({
      theme: getDefaultTheme(),
    }),
    {
      name: 'scrum-poker-theme',
      getStorage: () => localStorage,
    }
  )
);

const App: FunctionalComponent = () => {
  const theme = themeStore((state) => state.theme);
  const handleRoute = async (e: { url: string }): Promise<void> => {
    const room = stateStore.getState().room;

    if (room && !e.url.includes(room)) {
      stateStore.getState().socket?.emit('leave');
      stateStore.setState({ socket: null });
    }
  };

  return (
    <div id="preact_root" data-theme={theme}>
      <Header />
      <Router onChange={handleRoute}>
        <Route path="/" component={Home} />
        <Route path="/room/" component={Room} />
        <Route path="/room/:roomId" component={Room} />
        <NotFoundPage default />
      </Router>
    </div>
  );
};

export default App;
