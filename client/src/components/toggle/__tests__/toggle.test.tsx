import React, { h } from 'preact';
import { fireEvent, render, waitFor } from '@testing-library/preact';
import Toggle from '../toggle';
describe('toggle', () => {
  it('should render', () => {
    const wrapper = render(<Toggle />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should update the state when clicked', async () => {
    const wrapper = render(<Toggle />);
    const toggle = wrapper.getByTestId('theme-toggle');
    expect(wrapper.getByText('🌙')).toBeTruthy();
    await waitFor(() => {
      fireEvent.click(toggle);
      expect(wrapper.getByText('🌞')).toBeTruthy();
    });
  });
});
