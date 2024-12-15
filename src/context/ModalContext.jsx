import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    type: '',
    autoClose: false,
  });


  const timeoutRef = useRef(null);

  const showModal = ({ message, title , type , autoClose = false, duration = 3000}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setModalInfo({
      show: true,
      title,
      message,
      type,
      autoClose,
    });

    if (autoClose) {
      timeoutRef.current = setTimeout(() => {
        closeModal();
      }, duration);
    }
  };

  const closeModal = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    

    setModalInfo({
        show: false,
        title: '',
        message: '',
        type: '',
        autoClose: false,
      })
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ModalContext.Provider value={{ modalInfo, showModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};