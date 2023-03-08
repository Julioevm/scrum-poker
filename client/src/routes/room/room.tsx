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

interface Room {
  players: Player[];
  finished: boolean;
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
  const [room, setRoom] = useState<Room>({ players: [], finished: false });
  const [player, setPlayer] = useState<Player>({
    id: '0',
    name: getPlayerName(),
    vote: undefined,
  });
  const [showModal, setShowModal] = useState(player.name === 'Guest');
  const [showIdleModal, setShowIdleModal] = useState(false);

  const onIdle = () => {
    setShowIdleModal(true);
    socket?.disconnect();
  };

  const IDLE_TIME = 1000 * 60 * 5; // 5 minutes
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
    setPlayer((p) => {
      return { ...p, vote: undefined };
    });
  }

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        // If the player was in the middle of a vote send the vote back to the server.
        player.vote && socket?.emit('vote', player.vote);
        // Keep the name up to date in the sever after re-connections.
        emitName(socket, player.name);
      });

      socket.on('update', (updatedRoom: Room) => {
        setRoom(updatedRoom);
        setPlayer(
          updatedRoom.players.find((p) => p.id === socket.id) || player
        );
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
        <VotingResults show={room.finished} players={room.players} />
        <VotingMenu
          values={values}
          handlePlayerVote={handlePlayerVote}
          disabled={room.finished}
          vote={player.vote}
        />
        <button onClick={handleRestart}>
          {room.finished ? 'New Round' : 'Restart'}
        </button>
      </div>
    </>
  );
};

export default Room;
