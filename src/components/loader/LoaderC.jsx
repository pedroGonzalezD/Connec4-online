import styles from './LoaderC.module.scss';

const LoaderC = () => {
  return (
    <div className={styles.loader}>
    <div className={styles.circle}></div>
    <div className={styles.circle}></div>
    <div className={styles.circle}></div>
    <div className={styles.circle}></div>
  </div>
  );
};

export default LoaderC;