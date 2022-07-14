import { FunctionalComponent, h } from 'preact';
import { Route, Router } from 'preact-router';

import Home from '../routes/home';
import Room from '../routes/room';
import NotFoundPage from '../routes/notfound';
import Header from './header';
import create from 'zustand';
import { Socket } from 'socket.io-client';

export interface Player {
  id: string;
  name: string;
}
interface StateStore {
  socket: Socket | null;
  player: Player;
  room: string | undefined;
}
export const stateStore = create<StateStore>(() => ({
  socket: null,
  player: { id: '0', name: 'Guest' },
  room: undefined,
}));

const App: FunctionalComponent = () => {
  const handleRoute = async (e: { url: any }) => {
    const room = stateStore.getState().room;
    if (room && !e.url.includes(room)) {
      stateStore.getState().socket?.emit('leave');
    }
  };

  return (
    <div id="preact_root">
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
