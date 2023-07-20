import { FunctionalComponent, h } from 'preact';
import { Link, route } from 'preact-router';
import { io } from 'socket.io-client';
import { stateStore } from 'components/app';
import style from './style.css';
import { getServerURL } from 'Utils/utils';
import { useState } from 'preact/hooks';

const Home: FunctionalComponent = () => {
  const room = stateStore.getState().room;
  const server = getServerURL();
  const [loading, setLoading] = useState(false);

  function startGame(): void {
    setLoading(true);
    const newSocket = io(server);
    stateStore.setState({ socket: newSocket });
    const socket = stateStore.getState().socket;

    socket?.on('room', (roomId: string) => {
      setLoading(false);
      route(`/room/${roomId}`);
    });
  }

  return (
    <div class={style.wrapper}>
      <header class={style.home}>
        <h1>Scrum Poker</h1>
        <p>Welcome to Scrum Poker!</p>
      </header>
      <nav>
        {loading && <p>Loading...</p>}
        {!loading && <button onClick={startGame}>New Room</button>}
        {room && <Link href={`/room/${room}`}>Back to last room...</Link>}
      </nav>
    </div>
  );
};

export default Home;
