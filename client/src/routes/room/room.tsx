import { Player, stateStore } from 'components/app';
import IdleModal from 'components/idleModal/idleModal';
import NameModal from 'components/nameModal/nameModal';
import VotingMenu from 'components/votingMenu/VotingMenu';
import VotingResults from 'components/votingResults/VotingResults';
import { h, Fragment, FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useIdleTimer } from 'react-idle-timer';
import { io, Socket } from 'socket.io-client';
import { getServerURL } from 'Utils/utils';
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
  const server = getServerURL();
  const { roomId } = props;
  const socket = stateStore((state) => state.socket);
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player>({
    id: '0',
    name: getPlayerName(),
    vote: undefined,
  });
  const isNameSync = useRef(false);
  const [showVotes, setShowVotes] = useState(false);
  const [showModal, setShowModal] = useState(player.name === 'Guest');
  const [showIdleModal, setShowIdleModal] = useState(false);

  const onIdle = () => {
    setShowIdleModal(true);
    socket?.disconnect();
  };

  const IDLE_TIME = 1000 * 60 * 20;
  useIdleTimer({ onIdle, timeout: IDLE_TIME });

  const values = ['0', '0,5', '1', '2', '3', '5', '8', '?'];

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

  function syncName() {
    if (!isNameSync.current) {
      emitName(socket, player.name);
      isNameSync.current = true;
    }
  }

  useEffect(() => {
    if (socket) {
      syncName();

      socket.on('update', (updatedPlayers: Player[]) => {
        setPlayers(updatedPlayers);
      });

      socket.on('show', () => {
        setShowVotes(true);
      });

      socket.on('restart', () => {
        setShowVotes(false);
        setPlayer((p) => {
          return { ...p, vote: undefined };
        });
      });

      socket.on('ping', () => {
        socket.emit('pong');
      });
    } else {
      const newSocket = io(`${server}?roomId=${roomId}&name=${player.name}`);
      stateStore.setState({ socket: newSocket });
      stateStore.setState({ player: { ...player, id: newSocket.id } });
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
  }, [socket, roomId]);

  return (
    <>
      {showModal && (
        <NameModal
          name={player.name}
          onSubmit={updateName}
          onCancel={(): void => setShowModal(false)}
        />
      )}
      {showIdleModal && <IdleModal />}
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
        <VotingMenu
          values={values}
          handlePlayerVote={handlePlayerVote}
          disabled={showVotes}
          vote={player.vote}
        />
        <button onClick={handleRestart}>
          {showVotes ? 'New Round' : 'Restart'}
        </button>
      </div>
    </>
  );
};

export default Room;
