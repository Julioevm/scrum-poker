import { FunctionalComponent, h } from 'preact';
import { Route, Router } from 'preact-router';

import Home from '../routes/home';
import Room from '../routes/room';
import NotFoundPage from '../routes/notfound';
import Header from './header';
import create from 'zustand';
import { Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
}
export const socketStore = create<SocketState>(() => ({
  socket: null,
}));

const App: FunctionalComponent = () => {
  return (
    <div id="preact_root">
      <Header />
      <Router>
        <Route path="/" component={Home} />
        <Route path="/room/" component={Room} />
        <Route path="/room/:roomId" component={Room} />
        <NotFoundPage default />
      </Router>
    </div>
  );
};

export default App;
