import { h } from 'preact';
import VotingResults from '../VotingResults';
import { render, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';

describe('VotingMenu', () => {
  const players = [
    { id: 'id1', name: 'John', vote: '4' },
    { id: 'id2', name: 'Payne', vote: undefined },
    { id: 'id3', name: 'Dillon', vote: '3' },
  ];

  it('renders a list of players', () => {
    render(<VotingResults players={players} show={false} />);
    const voteLines = screen.getAllByTestId('player-vote-line');
    expect(voteLines.length).toBe(players.length);
  });

  describe('with show = false', () => {
    it('shouldnt show the player vote', async () => {
      render(<VotingResults players={[players[0]]} show={false} />);
      const vote = await screen.queryByText('4');
      expect(vote).not.toBeInTheDocument();
    });

    it('should display has voted if the player has voted', async () => {
      render(<VotingResults players={[players[0]]} show={false} />);
      const line = await screen.findByText(/John has voted/);
      expect(line).toBeVisible();
    });

    it('should display has not voted if the player has not voted', async () => {
      render(<VotingResults players={[players[1]]} show={false} />);
      const line = await screen.findByText(/Payne has not voted/);
      expect(line).toBeVisible();
    });
  });

  describe('with show = true', () => {
    it('should display has voted if the player has voted', async () => {
      render(<VotingResults players={[players[0]]} show={true} />);
      const line = await screen.queryByText(/John voted 4/);
      expect(line).toBeVisible();
    });
  });
});
