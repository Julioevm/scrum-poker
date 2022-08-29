import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import style from './style.css';

interface Props {
  title: string;
}

const Modal: FunctionalComponent<Props> = (props) => {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <div class={style.modal}>
      <div class={style.modalContent}>
        <div class="modal-header">
          <h2>{props.title}</h2>
        </div>
        <div class="modal-body">{props.children}</div>
      </div>
    </div>
  );
};

export default Modal;
