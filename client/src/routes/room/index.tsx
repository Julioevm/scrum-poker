import { Player, stateStore } from 'components/app';
import NameModal from 'components/nameModal/NameModal';
import VotingMenu from 'components/votingMenu/VotingMenu';
import VotingResults from 'components/votingResults/VotingResults';
import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { io, Socket } from 'socket.io-client';
import style from './style.css';

interface Props {
  roomId: string;
}

function emitName(socket: Socket, name: string) {
  socket.emit('name', name);
}

function getPlayerName() {
  const stateName = stateStore.getState().player.name;
  return stateName && stateName != 'Guest' ? stateName : 'Guest';
}

function copyLink(roomId: string) {
  return () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
  };
}

const Room = (props: Props) => {
  const { roomId } = props;
  const socket = stateStore((state) => state.socket);
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player>({
    id: '0',
    name: getPlayerName(),
    vote: undefined,
  });
  const [showVotes, setShowVotes] = useState(false);
  const [showModal, setShowModal] = useState(player.name === 'Guest');

  const values = ['0', '0,5', '1', '3', '5', '8', '?'];

  function updateName(name: string) {
    stateStore.setState({ player: { ...stateStore.getState().player, name } });
    setPlayer({ ...player, name });
    emitName(socket!, name);
    setShowModal(false);
  }

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

  function handleRestart() {
    socket?.emit('restart');
  }

  function setSocketHandlers() {
    if (!socket) return;

    socket.on('update', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on('show', () => {
      setShowVotes(true);
    });

    socket.on('restart', () => {
      setShowVotes(false);
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
    <>
      {showModal && (
        <NameModal
          name={player.name}
          onSubmit={updateName}
          onCancel={() => setShowModal(false)}
        />
      )}
      <div class={style.room}>
        <div class={style.roomName}>
          Room: {roomId}
          <button onClick={copyLink(roomId)}>Copy Link</button>
        </div>
        <p>Welcome, {player.name}.</p>{' '}
        <button onClick={() => setShowModal(true)}>Change Name</button>
        <VotingResults show={showVotes} players={players} />
        <VotingMenu values={values} handlePlayerVote={handlePlayerVote} />
        <button onClick={handleRestart}>Restart</button>
      </div>
    </>
  );
};

export default Room;
