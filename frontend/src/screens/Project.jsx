import React, { useState, useEffect ,useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/Axios';
import { initializeSocket,sendMessage,receiveMessage} from '../config/Socket';
import { UserContext } from '../context/user.context';

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('');
  const {user} = useContext(UserContext);
  const messageBox = React.createRef();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/all');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const addCollaborator = async () => {
    try {
      console.log('Selected users:', selectedUsers);  
      // Add API call here to add selected users to project
      await axios.put(`/projects/add-user`, {
        users: selectedUsers,
        projectId: project._id,
      });
      setIsAddUserModalOpen(false);
      setSelectedUsers([]);
      // Optionally refresh project data here
    } catch (error) {
      console.error('Error adding users:', error);
    }
  };

  const getProject = async () => {  
    try {
      const response = await axios.get(`/projects/get-project/${project._id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };
   
  const sendMessageToProject = () =>{
    sendMessage("project-message", { 
      message: message,
      sender: user,
    })
    console.log(message);
    appendOutgoingMessage({
      message: message,
      sender: user,
    });
    setMessage('');
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch users when modal opens
  useEffect(() => {
    if (isAddUserModalOpen) {
      fetchUsers();
    }
    getProject();
    initializeSocket(project._id);
    // Listen for incoming project messages
    receiveMessage("project-message", data => {
      console.log("Received message:", data);
      // Update your UI or state with the new message
      appendIncomingMessage(data);  
    });
  
  }, [isAddUserModalOpen]);

  const appendIncomingMessage = (messageObject) => {
    const messageBox = document.querySelector('.message-box');

    const message = document.createElement('div');
    message.classList.add('message', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-50', 'w-fit', 'rounded-md');
    message.innerHTML = `<small class='opacity-65 text-xs'>${messageObject.sender.email}</small> <p class='text-sm'>${messageObject.message}</p>`;
    messageBox.appendChild(message);
  }

  const appendOutgoingMessage = (messageObject) => {
    const messageBox = document.querySelector('.message-box');

    const message = document.createElement('div');
    message.classList.add('message', 'ml-auto', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-50', 'w-fit', 'rounded-md');
    message.innerHTML = `<small class='opacity-65 text-xs'>${messageObject.sender.email}</small> <p class='text-sm'>${messageObject.message}</p>`;
    messageBox.appendChild(message);
  }

  return (
    <main className='h-screen w-screen flex'>
      <section className="left flex flex-col h-full min-w-96 bg-slate-200">
        <header className='flex justify-between p-2 px-4 w-full bg-slate-400'>
          <button 
            className='p-2 flex items-center gap-1 text-black'
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <i className="ri-add-fill text-xl mr-1"></i>
            <p className='text-sm font-semibold text-black'>Add Collaborator</p>
          </button>
          <button 
            className='p-2'
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          >
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>
        {/* conversation-area */}
        <div className="conversation-area flex-grow flex flex-col">
          <div 
          ref={messageBox} 
          className="message-box flex-grow flex flex-col gap-1 p-1">
            <div className="message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className='opacity-65 text-xs '>example@gmail.com</small>
               <p className='text-sm'>Lorem ipsum dolor sit amet.</p>
              </div>
              <div className="message ml-auto max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className='opacity-65 text-xs '>example@gmail.com</small>
               <p className='text-sm'>Lorem ipsum dolor sit amet.</p>
              </div>
            <div className="outgoing"></div>
          </div>
          <div className="inputField w-full flex">
            <input onChange={(e)=>setMessage(e.target.value)} value={message} className='p-2 px-4 w-[85%] bg-white' type="text" placeholder='Enter a message' />
            <button onClick={sendMessageToProject} className='send flex-grow px-4 bg-blue-500'>
            <i className="ri-send-plane-2-fill text-2xl"></i>
            </button>
          </div>
        </div>
        
        {/* SIDE PANEL */}
        
        <div className={`sidePanel min-w-96 h-full flex flex-col gap-2 absolute transition-all duration-300 top-0 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}  bg-slate-100 `}>
          <header className='flex justify-between p-2 px-4 w-full bg-slate-400 items-center'>
            <h1 className='text-md font-bold text-black'>Collaborators</h1>
            <button className='p-2'
            onClick={()=>setIsSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-close-fill text-2xl"></i>
            </button>
          </header>
          <div className='users flex flex-col gap-2 p-2'> 
           {project.users && project.users.map((user)=>(
            <div key={user._id} className="user flex gap-2 items-center cursor-pointer hover:bg-slate-300 p-2 rounded-md bg-slate-200 transition-all duration-100">
               <div className='aspect-square h-fit w-fit rounded-full bg-slate-800 flex justify-center items-center p-4'>
                <i className="ri-user-fill text-xl text-slate-50 absolute"></i>
               </div>
              <p className='text-sm' >{user.email}</p>
            </div>
           ))}
          </div>
        </div>

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Add Collaborators</h2>
                  <button 
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full p-2 border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                        ${selectedUsers.includes(user._id) 
                          ? 'bg-blue-100 hover:bg-blue-200' 
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user._id) && (
                        <i className="ri-check-line text-blue-500 text-xl"></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t">
                <button
                  onClick={addCollaborator}
                  disabled={selectedUsers.length === 0}
                  className={`w-full py-2 rounded-lg text-white font-medium
                    ${selectedUsers.length === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  Add Selected Users ({selectedUsers.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

    </main>
  )
};

export default Project;

