import { h } from 'preact';
import './style.css';

interface Props {
  values: string[];
  handlePlayerVote: Function;
  disabled: boolean;
  vote: string | undefined;
}

function votingMenu(props: Props) {
  const { values, handlePlayerVote, disabled, vote } = props;
  const buttonClass = (value: string) => {
    return value === vote ? 'voted' : disabled ? 'disabled' : undefined;
  };

  return (
    <div class="menuWrapper">
      <p>Please vote:</p>
      {values.map((value) => (
        <button
          key={value}
          onClick={!disabled ? handlePlayerVote(value) : undefined}
          class={buttonClass(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export default votingMenu;
