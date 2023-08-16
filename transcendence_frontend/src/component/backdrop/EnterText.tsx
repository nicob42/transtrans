import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from './EnterText.module.css';
import SendIcon from '@mui/icons-material/Send';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import CreateChannelButton from './CreateChannelButton';
import { current } from '@reduxjs/toolkit';
import { ChatContext } from './ChatContext';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface EnterTextProps {
  socket: Socket;
}

type User = {
  username: string;
  imageUrl: string;
  id: number;
  // ajouter ici d'autres propriétés selon les besoins
};

type Channel = {
  id: number;
  name: string;
  banned: number[];
  muted: number[];
  // ajouter ici d'autres propriétés selon les besoins
};

const EnterText: React.FC<EnterTextProps> = ({ socket }) => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [latestChannel, setLatestChannel] = useState<Channel | null>(null);
  const [bannedAndMuted, setBannedAndMuted] = useState<Channel | null>(null);

  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    return null;
  }
  const { selectedChannel } = chatContext;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User, any>('http://localhost:4000/user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      }
    };

    fetchUser();
  }, []);


  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      send();
    }
  };

  const handleClick = () => {
    send();
  };

  useEffect(() => {
    const fetchBannedAndMuted = async () => {
	 if (selectedChannel)
	 {
      try {
        const response = await axios.get<Channel, any>(`http://localhost:4000/channels/${selectedChannel}`, { withCredentials: true });
		setBannedAndMuted(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      }
    };
}

    fetchBannedAndMuted();
  }, [selectedChannel]);

 const send = async () => {
	if (!user) {
	  console.error('User not logged in');
	  return;
	}

	if (selectedChannel?.id === undefined) {
	  console.error('No channel available');
	  return;
	}

	try {
	  const response = await axios.get(`http://localhost:4000/channels/${selectedChannel?.name}`, { withCredentials: true });
	  const bannedAndMuted = response.data;

	  if (bannedAndMuted.muted.includes(user.id)) {
		console.error('You are muted in this channel, cannot send a message.');
		return;
	  }

	  if (bannedAndMuted.banned.includes(user.id)) {
		console.error('You are banned from this channel, cannot send a message.');
		return;
	  }

	  if (!bannedAndMuted.members.includes(user.id)) {
		console.error('You are not member from this channel, cannot send a message.');
		return;
	  }

	  // Utilisez selectedChannel ici
	  socket.emit('chat message', { text: message, user: user, channelId: selectedChannel?.id });
	  setMessage('');
	} catch (error) {
	  console.error('Error fetching channel data:', error);
	}
  };


  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.input}>
        <input
          type="text"
          placeholder="Enter your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
      <CreateChannelButton/>
      <button className={styles.send_text} onClick={handleClick}>
        <SendIcon />
      </button>
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          This is a success message!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EnterText;
