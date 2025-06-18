import { FunctionalComponent, h } from 'preact';
import { Link } from 'preact-router/match';
import './style.css';
import Toggle from 'components/toggle/toggle';

const Header: FunctionalComponent = () => {
  return (
    <header class="header">
      <h1>Scrum Poker</h1>
      <Toggle />
      <nav>
        <Link activeClassName="active" path="/">
          Home
        </Link>
      </nav>
    </header>
  );
};

export default Header;
