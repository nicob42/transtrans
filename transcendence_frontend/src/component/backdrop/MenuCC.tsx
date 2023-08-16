import axios, { AxiosError } from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from './ChatContext';

interface MenuCCProps {
  handleClose: () => void;
}

interface User {
	id: number;
	username: string;
	imageUrl: string;
	// Ajoutez d'autres champs nécessaires ici
}

export const MenuCC: React.FC<MenuCCProps> = ({ handleClose }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isprivate, setIsPrivate] = useState(false);
  const [searchedchannel, setSearchedchannel] = useState('');
  const [searchedchannelPassword, setSearchedchannelPassword] = useState('');

  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('setRefreshKey is undefined, please check your context provider');
  }
  const { setRefreshKey, setSearchedChannel, setSelectedChannel } = context;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>('http://localhost:4000/user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      }
    };
    fetchUser();
  }, []);


  async function handleCreateChannel(name: string, password?: string, userId?: number, isprivate?: boolean, ) {
    const members: number[] = [];
    const admins: number[] = [];
	const owner: number[] = [];
	try {
      // vérifie si le canal existe
      const response = await axios.get(`http://localhost:4000/channels/${name}`);
      if(response.status === 404)
      {
        console.log('creation du channel')
      }
      // Si aucune erreur 404 n'est renvoyée, cela signifie que le canal existe déjà
    } catch (error) {
      const axiosError = error as AxiosError;
      // Si une erreur 404 est renvoyée, cela signifie que le canal n'existe pas et peut être créé
      if (axiosError.response && axiosError.response.status === 404) {
        const response = await fetch('http://localhost:4000/channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            password,
            userId,
            isprivate,
			      admins: [userId], // Ajoute l'ID de l'utilisateur à la liste des admins
         	  members: [userId],
			      owner: [userId], // Ajoute l'ID de l'utilisateur à la liste des membres
			      banned: [],
          }),
        });

        if (response.ok) {
          const channel = await response.json();
          handleClose(); // Fermer les div après la création du channel
          // setRefreshKey(Date.now());
          setSelectedChannel(channel);
        } else {
          console.error('Error creating channel:', response.statusText);
        }
      } else {
        console.error('Error checking if channel exists:', error);
      }
    }
  }






  async function updateChannelPasswordAndPrivateStatus(name: string, newPassword: string, newIsPrivate: boolean, userId?: number) {
    if (name.length > 0)
	{
	try {
      // Vérifie si le canal existe
      const response = await axios.get(`http://localhost:4000/channels/${name}`);
      console.log('reponse ===>'+ response.data.owner )

      // Si le canal existe
      if (response.status === 200) {
        // Vérifie si l'utilisateur est le propriétaire du canal
        if (response.data.owner.includes(userId)) {
          // Si oui, met à jour le mot de passe et l'état isprivate
          const updateResponse = await axios.put(`http://localhost:4000/channels/${name}`, {
            password: newPassword,
            isprivate: newIsPrivate,
          });

          if (updateResponse.status === 200) {
            console.log(`Password and private status for channel ${name} have been updated.`);
          } else {
            console.error('Error updating password and private status:', updateResponse.statusText);
          }
        } else {
          console.error('User is not the owner of the channel:', name);
        }
      } else {
        console.error('Channel does not exist:', name);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error checking if channel exists or updating password and private status:', axiosError);
    }
	handleClose();
  }
}


  const handleClickCreate = async () => {
    try {
      // Essayer de récupérer le canal)
      if(name){
		await handleCreateChannel(name, password, user?.id, isprivate);
        console.log('le channel est cree')
      }

      // Si le canal existe, mettre à jour le mot de passe et l'état isprivate
      await updateChannelPasswordAndPrivateStatus(name, password, isprivate, user?.id);
    } catch (error: any) {
      console.log ( 'rien')
    //  } else {
    //    console.error('Error creating or updating channel:', error.message);
      }
    };




  async function checkChannelExists(searchedchannel: string, userId?: number) {
	try {
	  const response = await axios.get(`http://localhost:4000/channels/${searchedchannel}`);
	  if (response.data.name) {
		console.log(response.data);
		handleClose();

		if (response.data.members && !response.data.members.includes(userId)) {
		  const newMembers = [...response.data.members, userId];
		  await axios.put(`http://localhost:4000/channels/${searchedchannel}/members`, {
			members: newMembers,
		  });
		  console.log(`Utilisateur avec l'ID ${userId} a rejoint le channel ${searchedchannel}`);
		} else {
		  console.log(`Utilisateur avec l'ID ${userId} est déjà membre du channel ${searchedchannel}`);
		}

		return response.data;
	  }
	} catch (error) {
	  const axiosError = error as AxiosError;
	  if (axiosError.response && axiosError.response.status === 404) {
		console.log("false");
	  } else {
		console.error('Erreur lors de la vérification de l\'existence du canal :', error);
	  }
	}
  }

const handleClickSearch = async () => {
const userId = user?.id; // Stockez l'ID de l'utilisateur dans une variable intermédiaire
const response = await axios.get(`http://localhost:4000/channels/${searchedchannel}`);
if (response.data.banned && response.data.banned.includes(userId)) {
	  console.log(`Utilisateur avec l'ID ${userId} est banni du channel ${searchedchannel}`);
	  return;
}
if(response.data.password !== searchedchannelPassword){
  console.log(`Le password ${searchedchannelPassword} ne correspond pas a celui du channel`)
  return;
}
  try {
    const channel = await checkChannelExists(searchedchannel, userId);  // channel est maintenant un objet
    if(channel) {
      setSelectedChannel(channel);  // Mettez l'objet canal dans le contexte
    } else {
      console.error('Canal recherché non trouvé:', searchedchannel);
    }
  } catch (error: any) {
    console.error('Erreur lors de la recherche du canal:', error.message);
  }
};

const handleClickQuit = async () => {
  setSelectedChannel(null);
  handleClose();
}


  return (
    <div className="container"
    style={{
        width:'75%',
        height:'180px',
        backgroundColor:'black',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
        position:'absolute',
        top:'77%',
        right:'10%',
        borderRadius:'15px',
    }}>
        <div className="inputs"
        style={{
            width:'100%',
            height:'100%',
            display:'flex',
            flexDirection:'column',
            alignItems:'flex-start',
            justifyContent:'center',
            gap:'10px',
            borderRadius:'20px',
            marginLeft:'10px',
        }}>
          <div className="input_channel" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Search a channel:</p>
                <input type="text"
                value={searchedchannel}
                onChange={(e) => setSearchedchannel(e.target.value)}
                style={{width:'130px', marginLeft:'10px'}}
                />
            </div>
            <div className="input_channel_password" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Channel password:</p>
                <input type="text"
                value={searchedchannelPassword}
                onChange={(e) => setSearchedchannelPassword(e.target.value)}
                style={{width:'130px', marginLeft:'10px'}}
                />
            </div>
            <p style={{color:'white'}}>======================</p>
            <div className="input_name" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Channel name:</p>
                <input type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{width:'130px', marginLeft:'10px'}}
                />
            </div>
            <div className="private" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Private:</p>
                <input
                type="checkbox"
                style={{marginLeft:'10px'}}
                onChange={(e) => setIsPrivate(e.target.checked)}
                />
            </div>
            <div className="input_password" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <p style={{color:'white', fontSize:'10px'}}>Password:</p>
            <input type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{width:'130px', marginLeft:'10px'}}
            />
            </div>

        </div>
        <div className="button"
        style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          flexDirection:'column',
          width:'50%',
          height:'100%',
        }}
        >
        <button
        style={{
            width:'100%',
            height:'100%',
            borderRadius:'15px',

        }} onClick={handleClickSearch}>
            Join
        </button>
        <button
        style={{
            width:'100%',
            height:'100%',
            borderRadius:'15px',

        }} onClick={handleClickCreate}>
            Create
        </button>
        <button
        style={{
            width:'100%',
            height:'100%',
            borderRadius:'15px',

        }} onClick={handleClickQuit}>
            Quit
        </button>

        </div>
    </div>
  )
}