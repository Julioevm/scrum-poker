import { h } from 'preact';
import VotingMenu from '../VotingMenu';
import { render, fireEvent, screen } from '@testing-library/preact';

describe('VotingMenu', () => {
  const values = ['0', '0,5', '1', '3', '5', '8', '?'];
  const handlePlayerVote = jest.fn();
  const props = {
    values,
    handlePlayerVote,
  };

  it('renders a button for each value', () => {
    const wrapper = render(<VotingMenu {...props} />);
    const buttons = wrapper.getAllByRole('button');
    expect(buttons.length).toBe(values.length);
  });
});   
