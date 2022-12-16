import React, { h } from 'preact';
import Modal from '../modal';
import { render, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';

describe('modal component', () => {
  beforeEach(() => {
    render(
      <Modal title="Title">
        <div>Hello!</div>
      </Modal>
    );
  });
  it('should render title', async () => {
    expect(await screen.findByText(/Title/)).toBeVisible();
  });

  it('should render children', async () => {
    expect(await screen.findByText(/Hello!/)).toBeVisible();
  });
});
