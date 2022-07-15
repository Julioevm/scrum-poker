import { Player, stateStore } from 'components/app';
import { FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { io, Socket } from 'socket.io-client';
import style from './style.css';

interface Props {
  roomId: string;
}

function emitName(socket: Socket, name: string) {
  socket.emit('name', name);
}

function askName(): string {
  return prompt('What is your name?') || 'Guest';
}

function getPlayerName() {
  const stateName = stateStore.getState().player.name;
  return stateName && stateName != 'Guest' ? stateName : askName();
}

const Room: FunctionalComponent<Props> = (props: Props) => {
  const { roomId } = props;
  const roomName = 'default';
  const socket = stateStore((state) => state.socket);
  const [players, setPlayers] = useState<Player[]>([]);

  function createSocketAndPlayer() {
    const name = getPlayerName();
    const newSocket = io(`http://localhost:3000?roomId=${roomId}&name=${name}`);
    stateStore.setState({ socket: newSocket });
    stateStore.setState({ player: { id: newSocket.id, name: name } });
  }

  function setSocketHandlers() {
    if (!socket) return;

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

  function unsubscribeEvents() {
    if (socket) {
      socket.off('ping');
      socket.off('update');
      socket.off('show');
      socket.off('restart');
    }
  }

  useEffect(() => {
    if (socket) {
      emitName(socket, getPlayerName());
      setSocketHandlers();
    } else {
      createSocketAndPlayer();
    }

    stateStore.setState({ room: roomId });

    return (): void => {
      unsubscribeEvents();
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
