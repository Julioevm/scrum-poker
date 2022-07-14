import { FunctionalComponent, h } from 'preact';
import { Link, route } from 'preact-router';
import { io, Socket } from 'socket.io-client';
import { socketStore } from 'components/app';
import style from './style.css';

const Home: FunctionalComponent = () => {
  function startGame(): void {
    // Todo: use stored ENV variables to get the server address
    const newSocket = io('http://127.0.0.1:3000');
    socketStore.setState({ socket: newSocket });
    const socket = socketStore.getState().socket;
    socket!.on('room', (roomId: string) => {
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
        <button onClick={startGame}>New Room</button>
        <Link href="/room/john">John</Link>
      </nav>
    </div>
  );
};

export default Home;
