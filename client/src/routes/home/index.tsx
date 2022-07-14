import { FunctionalComponent, h } from 'preact';
import { Link, route } from 'preact-router';
import { MutableRef } from 'preact/hooks';
import { io, Socket } from 'socket.io-client';
import style from './style.css';


interface Props {
  socket: MutableRef<Socket>;
}

const Home: FunctionalComponent = () => {
  function startGame(): void {
    // Todo: use stored ENV variables to get the server address
    const socket = io('http://127.0.0.1:3000');
    // Todo: Store the socket in the state so we can use it in the component

    socket.on('room', (roomId: string) => {
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
