import { FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.css';

interface Props {
  roomId: string;
}

const Room: FunctionalComponent<Props> = (props: Props) => {
  const { roomId } = props;
  const [time, setTime] = useState<number>(Date.now());
  const roomName = 'default';

  // gets called when this route is navigated to
  useEffect(() => {
    const timer = window.setInterval(() => setTime(Date.now()), 1000);

    // gets called just before navigating away from the route
    return (): void => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div class={style.room}>
      <h1>Room: {roomId}</h1>
      <p>Welcome to room {roomName}.</p>

      <div>Current time: {new Date(time).toLocaleString()}</div>
    </div>
  );
};

export default Room;
