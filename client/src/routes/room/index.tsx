import { Player, stateStore } from 'components/app';
import VotingMenu from 'components/votingMenu/VotingMenu';
import VotingResults from 'components/votingResults/VotingResults';
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

function copyLink(roomId: string) {
  const link = `${window.location.origin}/room/${roomId}`;
  navigator.clipboard.writeText(link);
}

const Room: FunctionalComponent<Props> = (props: Props) => {
  const { roomId } = props;
  const socket = stateStore((state) => state.socket);
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player>({
    id: '0',
    name: getPlayerName(),
    vote: undefined,
  });
  const [show, setShow] = useState(false);

  const values = ['0', '0,5', '1', '3', '5', '8', '?'];

  function createSocketAndPlayer() {
    const newSocket = io(
      `http://localhost:3000?roomId=${roomId}&name=${player.name}`
    );
    stateStore.setState({ socket: newSocket });
    stateStore.setState({ player: { ...player, id: newSocket.id } });
  }

  function handlePlayerVote(value: string) {
    return (): void => {
      socket?.emit('vote', value);
      setPlayer({ ...player, vote: value });
    };
  }

  function setSocketHandlers() {
    if (!socket) return;

    socket.on('update', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on('show', () => {
      console.log('Show');
      setShow(true);
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
      emitName(socket, player.name);
      setSocketHandlers();
    } else {
      createSocketAndPlayer();
    }

    stateStore.setState({ room: roomId });

    return (): void => {
      unsubscribeEvents();
    };
  }, [socket]);

  return (
    <div class={style.room}>
      <p>Room: {roomId}</p>{' '}
      <button onClick={() => copyLink(roomId)}>Copy Link</button>
      <p>Welcome, {player.name}.</p>
      <VotingResults show={show} players={players} />
      <VotingMenu values={values} handlePlayerVote={handlePlayerVote} />
      <button
        onClick={() => {
          socket?.emit('restart');
        }}
      >
        Restart
      </button>
    </div>
  );
};

export default Room;
