import styles from './Modal.module.scss';
import { useModal } from '../../context/ModalContext';

const Modal = () => {
  const { modalInfo, closeModal } = useModal();
  const { show, title, message, type, autoClose } = modalInfo;

  if (!show) return null;

  return (
    <div className={`${styles.modalOverlay} ${styles[type]}`}>
      <div className={styles.modal}>
        <h2 className={type}><img src={`/svg/${type}.svg`} alt={type} />{title}</h2>
        <p>{message}</p>
        {!autoClose &&<button onClick={closeModal}>close</button>}
      </div>
    </div>
  );
};

export default Modal;
