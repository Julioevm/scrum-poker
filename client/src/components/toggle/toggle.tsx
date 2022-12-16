import { Fragment, FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import React from 'react';
import { themeStore } from '../app';
import style from './style.css';

const Toggle: FunctionalComponent = () => {
  const theme = themeStore.getState().theme;
  const [isDark, setIsDark] = useState(theme === 'dark');
  const switchTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    themeStore.setState({ theme: newTheme });
    setIsDark(!isDark);
  };

  return (
    <Fragment>
      {isDark ? '🌞' : '🌙'}
      <div className={style.switchWrapper}>
        <input
          checked={isDark}
          onChange={switchTheme}
          className={style.switchCheckbox}
          id={'switch'}
          type="checkbox"
          data-testid="theme-toggle"
        />
        <label className={style.switchLabel} htmlFor={`switch`}>
          <span className={style.switchButton} />
        </label>
      </div>
    </Fragment>
  );
};

export default Toggle;
