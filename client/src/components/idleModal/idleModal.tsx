import Modal from 'components/modal/modal';
import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

const IdleModal: FunctionalComponent = () => {
  const button = useRef<HTMLButtonElement>(null);
  const handleSubmit = () => {
    window.location.reload();
  };

  useEffect(() => {
    button.current?.focus();
  }, []);

  return (
    <Modal title="Idle...">
      <div>
        <button class="button" onClick={handleSubmit} ref={button}>
          Re-connect
        </button>
      </div>
    </Modal>
  );
};

export default IdleModal;
