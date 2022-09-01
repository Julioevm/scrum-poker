import { h } from 'preact';
import Room from '../room';
import { fireEvent, render, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';
import socketIOClient from 'socket.io-client';
import SocketMock from 'socket.io-mock';
import React from 'react';

jest.mock('socket.io-client');

describe('modal component', () => {
  let socket;
  beforeEach(() => {
    socket = new SocketMock();
    (socketIOClient as jest.Mock).mockReturnValue(socket);
    render(<Room roomId="roomId1" />);
  });

  it('should default to guest name if we cancel the player name modal', async () => {
    expect(screen.queryByText('Enter your name')).toBeVisible();
    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.queryByText('Welcome, Guest.')).toBeVisible();
  });

  it('should set the name player after we fill in the modal', async () => {
    // Mute the console for this particular error.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(screen.queryByText('Enter your name')).toBeVisible();
    fireEvent.input(screen.getByTestId('name-input'), {
      target: { value: 'Johnny' },
    });
    await fireEvent.click(screen.getByText(/submit/i));
    expect(screen.getByText('Welcome, Johnny.')).toBeVisible();
  });
});
