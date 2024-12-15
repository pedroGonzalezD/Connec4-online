import { createContext, useContext, useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { accessToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      console.log("Unauthenticated user, socket connection not established.");
      return;
    }

    console.log(accessToken)
    const socketIo = io(import.meta.env.VITE_API_URL, {
      auth: { accessToken }
    });

    socketIo.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socketIo.on("match_found", ({ roomId }) => {
      setCurrentRoom(roomId);
    });

    socketIo.on("room_created", ({ roomId }) => {
      setCurrentRoom(roomId);
    });

    socketIo.on("joined_room", ({ roomId }) => {
      setCurrentRoom(roomId);
    });

    socketIo.on("room_left", () => {
      setCurrentRoom(null);
    });

    socketIo.on("disconnect", () => {
      console.log("Socket disconnected.");
      setCurrentRoom(null);
    });

    setSocket(socketIo);
    console.log('Socket connection established.');

    return () => {
      socketIo.off("connect_error");
      socketIo.off("match_found");
      socketIo.off("room_created");
      socketIo.off("joined_room");
      socketIo.off("room_left");
      socketIo.off("disconnect");

      socketIo.disconnect();
      setSocket(null);
      setCurrentRoom(null);
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket, setCurrentRoom, currentRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
