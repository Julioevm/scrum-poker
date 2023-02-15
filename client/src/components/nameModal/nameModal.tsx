import Modal from 'components/modal/modal';
import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { sanitize } from 'Utils/utils';

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
    setName(sanitize(e.target.value));
  };

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <Modal title="Enter your name">
      <form>
        <input
          label="name"
          type="text"
          value={name}
          onInput={handleChange}
          ref={input}
          placeholder={name}
          data-testid="name-input"
          maxLength={24}
          name="name"
        />
        <div>
          <button class="button" onClick={handleSubmit}>
            Submit
          </button>
          <button class="button" onClick={props.onCancel} type="button">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NameModal;
