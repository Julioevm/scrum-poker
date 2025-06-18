import { FunctionalComponent, h } from 'preact';
import './style.css';

interface Props {
  title: string;
}

const Modal: FunctionalComponent<Props> = (props) => {
  return (
    <div class="modal">
      <div class="modalContent">
        <div>
          <h2>{props.title}</h2>
        </div>
        <div>{props.children}</div>
      </div>
    </div>
  );
};

export default Modal;
