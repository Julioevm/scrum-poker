import { FunctionalComponent, h } from 'preact';

interface Props {
  values: string[];
  handlePlayerVote: Function;
}
function votingButtons(values: string[], handlePlayerVote: Function) {
  // a function that renders a list of buttons for voting based on the values array
  return values.map((value) => <button onClick={handlePlayerVote(value)}>{value}</button>);
}

function votingMenu(props: Props) {
  const { values, handlePlayerVote } = props;
  return (
    <div>
      <p>Please vote:</p>
      {votingButtons(values, handlePlayerVote)}
    </div>
  );
}

export default votingMenu;
