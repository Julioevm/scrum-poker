import { render } from '@testing-library/preact';
import Header from '../header';
import '@testing-library/jest-dom';
import { h } from 'preact';
import React from 'react';

describe('Header component', function () {
  it('should render', () => {
    const wrapper = render(<Header />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render Home button', () => {
    const wrapper = render(<Header />);
    expect(wrapper.getByText('Home')).toBeInTheDocument();
  });
});
