import { Fragment, FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { themeStore } from '../app';
import  './style.css';

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
      <div className={"switchWrapper"}>
        <input
          checked={isDark}
          onChange={switchTheme}
          className={"switchCheckbox"}
          id={'switch'}
          type="checkbox"
          data-testid="theme-toggle"
        />
        <label className={"switchLabel"} htmlFor={`switch`}>
          <span className={"switchButton"} />
        </label>
      </div>
    </Fragment>
  );
};

export default Toggle;
