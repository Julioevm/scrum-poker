import { Player } from 'components/app';
import { h } from 'preact';
import style from './style.css';

interface Props {
  players: Player[];
  show: boolean;
}

function playerVotes(players: Player[], show: boolean) {
  return players.map((player) => (
    <div>
      <div
        class={player.vote ? style.voted : undefined}
        data-testid="player-vote-line"
      >
        {player.name}{' '}
        {show
          ? `voted ${player.vote}`
          : player.vote
          ? 'has voted'
          : 'has not voted'}
      </div>
    </div>
  ));
}

function VotingResults(props: Props) {
  const { players, show } = props;

  return (
    <div>
      <p>Players:</p>
      {playerVotes(players, show)}
    </div>
  );
}

export default VotingResults;
