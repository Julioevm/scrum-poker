import { Player } from 'components/app';
import { h } from 'preact';

interface Props {
  players: Player[];
  show: boolean;
}

function playerVotes(players: Player[], show: boolean) {
  return players.map((player) => (
    <div>
      <p>
        {player.name}{' '}
        {show
          ? `voted ${player.vote}`
          : player.vote
          ? 'has voted'
          : 'has not voted'}
      </p>
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
