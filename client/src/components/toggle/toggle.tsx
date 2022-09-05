import { FunctionalComponent, h } from 'preact';
import React from 'react';
import { themeStore } from '../app';
//import style from './style.css';

const Toggle: FunctionalComponent = () => {
  const theme = themeStore.getState().theme;
  const switchTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    themeStore.setState({ theme: newTheme });
  };

  return <button onClick={switchTheme}>Toggle</button>;
};

export default Toggle;
