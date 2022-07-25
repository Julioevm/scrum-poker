import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import style from './style.css';

interface Props {
  name: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const NameModal: FunctionalComponent<Props> = (props) => {
  const [name, setName] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const handleSubmit = () => {
    props.onSubmit(name);
  };

  const handleChange = (e: any) => {
    setName(e.target.value);
  };

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <div class={style.modal}>
      <div class={style.modalContent}>
        <div class="modal-header">
          <h2>Enter your name</h2>
        </div>
        <div class="modal-body">
          <form>
            <input
              label="name"
              type="text"
              value={name}
              onInput={handleChange}
              ref={input}
              placeholder={name}
            />
            <div class={style.modalButtons}>
              <button class="button" onClick={handleSubmit}>
                Submit
              </button>
              <button class="button" onClick={props.onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NameModal;
