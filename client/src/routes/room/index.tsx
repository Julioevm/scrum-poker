import { Player, stateStore } from 'components/app';
import { FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Socket } from 'socket.io-client';
import style from './style.css';

interface Props {
  roomId: string;
}

function emitName(socket: Socket, name: string) {
  socket.emit('name', name);
}

const Room: FunctionalComponent<Props> = (props: Props) => {
  const { roomId } = props;
  const roomName = 'default';
  const socket = stateStore.getState().socket;
  const [players, setPlayers] = useState<Player[]>([]);

  const askName = () => {
    const name = prompt('What is your name?');
    if (name && socket) {
      emitName(socket, name);
      setPlayers([...players, { id: socket.id, name }]);
    }
  };

  const getPlayer = () => {
    const name = stateStore.getState().player.name;
    if (name !== 'Guest' && socket) {
      emitName(socket, name);
      setPlayers([...players, { id: socket.id, name }]);
    } else {
      askName();
    }
  };

  useEffect(() => {
    if (socket) {
      getPlayer();

      socket.on('update', (updatedPlayers: Player[]) => {
        setPlayers(updatedPlayers);
      });

      socket.on('show', () => {
        console.log('Show');
      });

      socket.on('restart', () => {
        console.log('Restart');
      });

      socket.on('ping', () => {
        socket.emit('pong');
      });
    }

    return (): void => {
      if (socket) {
        socket.off('ping');
        socket.off('update');
        socket.off('show');
        socket.off('restart');
      }
    };
  }, [socket]);

  const renderPlayers = (): JSX.Element[] => {
    return players.map((player: Player) => {
      return (
        <div className={style.playerName} key={player.id}>
          {player.name}
        </div>
      );
    });
  };

  return (
    <div class={style.room}>
      <h1>Room: {roomId}</h1>
      <p>Welcome to room {roomName}.</p>
      {renderPlayers()}
    </div>
  );
};

export default Room;
