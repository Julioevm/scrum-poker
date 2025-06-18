import { render, h } from 'preact';
import './style/index.css';
import App from './components/app';

render(<App />, document.getElementById('app') as HTMLElement);
