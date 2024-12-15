import { useEffect, useState } from 'react'
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'
import LoaderC from '../../components/loader/LoaderC'
import ModalC from '../../components/modal/ModalC';
import styles from './Lobby.module.scss';
import { useForm } from 'react-hook-form';

const Lobby = () => {
  const {socket} = useSocket()
  const navigate = useNavigate();
  const { username, logout } = useAuth()
  const { showModal } = useModal()
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const [pendingRoomId, setPendingRoomId] = useState(null);

  const { register, handleSubmit: handleCreateRoomSubmit, reset } = useForm();

  useEffect(() =>{
    if(!socket) return
    socket.on("available_rooms", (rooms) => {
      setAvailableRooms(rooms);
    });
    
    socket.emit("get_available_rooms")

    socket.on("match_found", ({ roomId, roomName }) => {
      showModal({
        title: 'Match Found',
        message: `You have been matched to "${roomName}". Redirecting to the game...`,
        type: 'success',
        autoClose: true
      });
      setIsSearching(false);
      setTimeout(() => {
        navigate(`/game/${roomId}`);
      }, 3000);
    });
    

    socket.on("room_created", ({ roomId, roomName }) => {
      showModal({
        title: 'Room Created',
        message: `Room "${roomName}" has been created. Redirecting to the room...`,
        type: 'success',
        autoClose: true
      });
      setTimeout(() => {
        navigate(`/game/${roomId}`);
      }, 3000);
    })

    socket.on("joined_room", ({ roomId, roomName }) => {
      showModal({
        title: 'Joined Room',
        message: `You have joined "${roomName}". Redirecting to the game...`,
        type: 'success',
        autoClose: true
      });
      setTimeout(() => {
        navigate(`/game/${roomId}`);
      }, 3000); 
    });

    socket.on("error_message", (message) => {
      showModal({
        title: 'Error',
        message: message,
        type: 'error',
      });
      
      if (message.includes("disconnected")) {
        setTimeout(() => {
          navigate('/login'); 
        }, 3000); 
      }
    });

    return () => {
      socket.off("match_found");
      socket.off("available_rooms");
      socket.off("error_message");
      socket.off("room_created");
      socket.off("joined_room");
    };
    
  }, [socket, navigate, showModal])

  const findMatch = () => {
    if (isSearching) {
      showModal({
        title: 'Already Searching',
        message: 'You are already searching for a match.',
        type: 'warning',
      });
      return;
    }

    setIsSearching(true);
    socket.emit('find_match');
  }

  const openCreateRoomModal = () => {
    setShowCreateRoomModal(true);
  };

  const onCreateRoom = handleCreateRoomSubmit((data) => {
    const { roomName } = data;
    if (!roomName) return;
    socket.emit('create_room', roomName);
    setShowCreateRoomModal(false);
    reset();
  });

  const joinRoom = (roomId) => {
    setPendingRoomId(roomId);
  };

  const confirmJoinRoom = () => {
    if (!pendingRoomId) return;
    socket.emit('join_room', pendingRoomId);
    setPendingRoomId(null);
  };

  const cancelJoinRoom = () => {
    setPendingRoomId(null);
  };

  return (
    <>
      {isSearching && 
        <ModalC>
          <p className={styles.searching}>searching match</p>
          <div className={styles.loaderCont}><LoaderC/></div>
          <button className={styles.cancel} onClick={() =>{
            socket.emit('cancel_match')
            setIsSearching(false)
          }}>Cancel</button>
        </ModalC>
      }

      {showCreateRoomModal && (
        <ModalC>
          <div className={styles.create}>
          <h2>Create a Room</h2>
          <form onSubmit={onCreateRoom} className={styles.createRoomForm}>
            <label htmlFor="roomName">Room Name:</label>
            <input 
              type="text"
              id="roomName"
              {...register('roomName', { required: true })}
            />
            <div className={styles.formActions}>
              <button type="submit" className={styles.button}>Create</button>
              <button className={styles.cancel} onClick={() => {setShowCreateRoomModal(false); reset();}}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        </ModalC>
      )}

      {pendingRoomId && (
        <ModalC>
        <div className={styles.join}>
          <h2>Join Room</h2>
          <p>Do you want to join this room?</p>
          <div className={styles.formActions}>
            <button className={styles.button} onClick={confirmJoinRoom}>Yes</button>
            <button className={styles.cancel} onClick={cancelJoinRoom}>No</button>
          </div>
        </div>
        </ModalC>
      )}

      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.message}>
            <h1>Connect 4 Online</h1>
            <p>Welcome, <span>{username}!</span></p>
          </div>
          <div className={styles.actions}>
            <button className={styles.button} onClick={findMatch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Find Match'}
            </button>
            <button className={styles.button} onClick={openCreateRoomModal}>
              Create Room
            </button>
            <button onClick={logout} className={`${styles.logOut} ${styles.button}`}>
              logout
            </button>
          </div>
        </div>
    
        <div className={styles.rooms}>
          <h2>Available Rooms</h2>
          {availableRooms.length === 0 ? (
            <p className={styles.p}>No available rooms at the moment.</p>
          ) : (
            <ul className={styles.ul}>
              {availableRooms.map((room) => (
                <li key={room.roomId} className={styles.room}>
                  <p>{room.roomName}</p>
                  <span><img src="/svg/user.svg" alt="user" />{room.players}/2</span>
                  <button className={styles.button} onClick={() => joinRoom(room.roomId)}>Join Room</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.announcements}>
          <div>
            <img src="/svg/trophy.svg" alt="trophy" />
            <h3>Leaderboard</h3>
          </div>
          <p>Compete and climb the leaderboard! Coming soon...</p>
        </div>
      </div>
    </>
  );
};

export default Lobby;
