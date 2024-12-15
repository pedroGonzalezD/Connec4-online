import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import styles from './Game.module.scss';
import Loader from '../../components/loader/Loader';
import ModalC from '../../components/modal/ModalC';

const Game = () => {
  const { roomId } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState('');
  const [gameState, setGameState] = useState({
    board: Array(6).fill(null).map(() => Array(7).fill(null)),
    currentPlayer: null,
    isMyTurn: false,
    winner: null,
    players: [],
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!gameState.winner) {
        socket.emit('surrender', roomId);
        localStorage.setItem('reload_flag', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState.winner, roomId, socket]);

  useEffect(() => {
    if (!socket) return;

    const flag = localStorage.getItem('reload_flag');
    if (flag === 'true') {
      localStorage.removeItem('reload_flag');
      navigate('/lobby');
    } else {
      socket.emit('join_game', roomId);
    }
  }, [socket, roomId, navigate]);

  useEffect(() => {
    if (gameState.winner) return;

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      setShowModal('return');
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [gameState.winner]);

  useEffect(() => {
    if (!socket) return;

    socket.on('game_state', handleGameState);
    socket.on('game_over', handleGameOver);
    socket.on('game_start', handleGameStart);

    return () => {
      socket.off('game_state', handleGameState);
      socket.off('game_over', handleGameOver);
      socket.off('game_start', handleGameStart);
    };
  }, [socket]);

  const handleGameState = (state) => {
    setGameState(state);
    setLoading(false);
  };

  const handleGameStart = () => {
    setShowModal('start');
  };

  const handleGameOver = ({ winnerId, reason }) => {
    if (reason === 'draw') {
      setShowModal('draw');
    } else if (winnerId === socket.id) {
      setShowModal('victory');
    } else {
      setShowModal('defeat');
    }

    setTimeout(() => {
      navigate('/lobby');
    }, 3000);
  };

  const handleColumnClick = (columnIndex) => {
    if (!gameState.isMyTurn || gameState.winner) return;
    socket.emit('make_move', roomId, columnIndex);
  };

  const handleSurrender = () => {
    setShowModal('surrender');
  };

  const confirmSurrender = () => {
    socket.emit('surrender', roomId);
    navigate('/lobby');
  };

  const confirmBackNavigation = () => {
    socket.emit('surrender', roomId);
    navigate('/lobby');
  };

  const cancelModal = () => {
    setShowModal('');
  };

  const renderBoard = () => {
    return gameState.board.map((row, rowIndex) => (
      <div key={rowIndex} className={styles.row}>
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            onClick={() => handleColumnClick(colIndex)}
            className={styles.cell}
            style={{
              backgroundColor: cell || 'white',
              cursor: gameState.isMyTurn && !gameState.winner ? 'pointer' : 'default',
            }}
          ></div>
        ))}
      </div>
    ));
  };

  return (
    <div className={styles.gameContainer}>
      {loading && <Loader />}
      {showModal === 'victory' && (
        <ModalC>
          <p className={styles.p}><span className={styles.win}>You won!</span> Redirecting to the lobby...</p>
        </ModalC>
      )}
      {showModal === 'defeat' && (
        <ModalC>
          <p className={styles.p}><span className={styles.lost}>You lost!</span> Redirecting to the lobby...</p>
        </ModalC>
      )}
      {showModal === 'draw' && (
        <ModalC>
          <p className={styles.p}><span className={styles.draw}>It is a draw!</span> Redirecting to the lobby...</p>
        </ModalC>
      )}
      {showModal === 'surrender' && (
        <ModalC>
          <p className={styles.p}>You are about to surrender. The opponent will win. Are you sure?</p>
          <div className={styles.modalButtons}>
            <button className={styles.button} onClick={confirmSurrender}>Surrender</button>
            <button className={styles.cancel} onClick={cancelModal}>Cancel</button>
          </div>
        </ModalC>
      )}
      {showModal === 'return' && (
        <ModalC>
          <p className={styles.p}>If you go back, you will lose the game. Are you sure?</p>
          <div className={styles.modalButtons}>
            <button className={styles.button} onClick={confirmBackNavigation}>Leave</button>
            <button className={styles.cancel} onClick={cancelModal}>Cancel</button>
          </div>
        </ModalC>
      )}
      <div className={styles.cont}>

      <h1 className={styles.gameTitle}>Connect 4 Game - Room {roomId}</h1>
      {gameState.winner ? (
        gameState.winner === 'draw' ? (
          <h2 className={styles.gameTurn}>It is a draw!</h2>
        ) : (
          <h2 className={styles.gameTurn}>Winner: {gameState.winner.toUpperCase()}!</h2>
        )
      ) : (
        <h2 className={styles.gameTurn}>
          Turn: {gameState.isMyTurn ? 'You' : 'Opponent'} (
          {gameState.currentPlayer ? gameState.currentPlayer.toUpperCase() : 'N/A'})
        </h2>
      )}
      </div>
      <div className={styles.board}>{renderBoard()}</div>
      <div className={styles.cont}>

      <button className={styles.surrenderButton} onClick={handleSurrender} disabled={gameState.winner}>
        Surrender
      </button>
      </div>
    </div>
  );
};

export default Game;
