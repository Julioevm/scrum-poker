import { Player, stateStore } from 'components/app';
import NameModal from 'components/nameModal/NameModal';
import VotingMenu from 'components/votingMenu/VotingMenu';
import VotingResults from 'components/votingResults/VotingResults';
import { h, Fragment, FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { io, Socket } from 'socket.io-client';
import style from './style.css';

interface Props {
  roomId: string;
}

function emitName(socket: Socket | null, name: string): void {
  socket && socket.emit('name', name);
}

function getPlayerName(): string {
  const stateName = stateStore.getState().player.name;
  return stateName && stateName != 'Guest' ? stateName : 'Guest';
}

function copyLink(roomId: string) {
  return (): void => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
  };
}

const Room: FunctionComponent<Props> = (props) => {
  const { roomId } = props;
  const socket = stateStore((state) => state.socket);
  console.log(socket);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player>({
    id: '0',
    name: getPlayerName(),
    vote: undefined,
  });
  const [showVotes, setShowVotes] = useState(false);
  const [showModal, setShowModal] = useState(player.name === 'Guest');

  const values = ['0', '0,5', '1', '3', '5', '8', '?'];

  function updateName(name: string): void {
    stateStore.setState({ player: { ...stateStore.getState().player, name } });
    setPlayer({ ...player, name });
    emitName(socket, name);
    setShowModal(false);
  }

  function handlePlayerVote(value: string) {
    return (): void => {
      socket?.emit('vote', value);
      setPlayer({ ...player, vote: value });
    };
  }

  function handleRestart(): void {
    socket?.emit('restart');
  }

  useEffect(() => {
    function createSocketAndPlayer(): void {
      const newSocket = io(
        `http://localhost:3000?roomId=${roomId}&name=${player.name}`
      );
      stateStore.setState({ socket: newSocket });
      stateStore.setState({ player: { ...player, id: newSocket.id } });
    }

    if (socket) {
      emitName(socket, player.name);
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
    } else {
      console.log('no socket');

      createSocketAndPlayer();
    }

    stateStore.setState({ room: roomId });

    return (): void => {
      if (socket) {
        socket.off('ping');
        socket.off('update');
        socket.off('show');
        socket.off('restart');
      }
    };
  }, [socket, player, roomId]);

  return (
    <>
      {showModal && (
        <NameModal
          name={player.name}
          onSubmit={updateName}
          onCancel={(): void => setShowModal(false)}
        />
      )}
      <div class={style.room}>
        <div class={style.playerName}>
          <h2>Welcome, {player.name}.</h2>{' '}
          <button class="buttonLink" onClick={(): void => setShowModal(true)}>
            Change Name
          </button>
        </div>
        <div class={style.roomName}>
          Room: {roomId}{' '}
          <button class="buttonLink" onClick={copyLink(roomId)}>
            Copy Invite Link
          </button>
        </div>
        <VotingResults show={showVotes} players={players} />
        <VotingMenu values={values} handlePlayerVote={handlePlayerVote} />
        <button onClick={handleRestart}>
          {showVotes ? 'New Round' : 'Restart'}
        </button>
      </div>
    </>
  );
};

export default Room;
