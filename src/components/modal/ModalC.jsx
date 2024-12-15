import styles from './ModalC.module.scss';

function ModalC({ children }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalC;
