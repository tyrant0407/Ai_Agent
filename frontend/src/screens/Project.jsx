import React, { useState, useEffect, useContext, useRef } from "react"
import { useLocation } from "react-router-dom";
import axios from "../config/Axios";
import { initializeSocket, sendMessage, receiveMessage } from "../config/Socket"
import { UserContext } from "../context/user.context";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { getWebContainer } from "../config/WebContainer"

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-')) {
      hljs.highlightElement(ref.current);

      // Ensure reprocessing works correctly
      ref.current.removeAttribute('data-highlighted');
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
  }

const Project = () => {
  const location = useLocation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState("")
  const { user } = useContext(UserContext)
  const messageBoxRef = useRef(null)
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)

  useEffect(() => {
    getProject()
    initializeSocket(project._id)
    if(!webContainer){
      getWebContainer().then(container =>{
        setWebContainer(container)
        console.log("container started")
      })
    }
    receiveMessage("project-message", appendIncomingMessage)
  }, [])

  useEffect(() => {
    if (isAddUserModalOpen) {
      fetchUsers()
    }
  }, [isAddUserModalOpen])

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight
    }
  }, [project.message])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users/all")
      setUsers(response.data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const addCollaborator = async () => {
    try {
      await axios.put(`/projects/add-user`, {
        users: selectedUsers,
        projectId: project._id,
      })
      setIsAddUserModalOpen(false)
      setSelectedUsers([])
      getProject()
    } catch (error) {
      console.error("Error adding users:", error)
    }
  }

  const getProject = async () => {
    try {
      const response = await axios.get(`/projects/get-project/${project._id}`)
      setProject(response.data.project)
    } catch (error) {
      console.error("Error fetching project:", error)
    }
  }

  const sendMessageToProject = () => {
    if (message.trim()) {
      sendMessage("project-message", {
        message: message,
        sender: user,
      })
      appendOutgoingMessage({
        message: message,
        sender: user,
      })
      setMessage("")
    }
  }

  const scrolltoBottom = () => {  
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }

  const appendIncomingMessage = (messageObject) => {

    const message = JSON.parse(messageObject.message);

    webContainer?.mount(message.fileTree)

    if(message.fileTree){
      setFileTree(message.fileTree)
    }
    console.log("Received message:", JSON.parse(messageObject.message));
    setProject((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), messageObject],
    }));
    setTimeout(scrolltoBottom, 0);
  }

  const appendOutgoingMessage = (messageObject) => {
    setProject((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), messageObject],
    }));
    setTimeout(scrolltoBottom, 0);
  }
 
  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()))

  function WriteAiMessage(message) {
    let messageObject;
    
    try {
      messageObject = JSON.parse(message);
     
    } catch (error) {
      console.error("Error parsing AI message:", error);
      return <div className="bg-red-600 text-white p-2 rounded-md">Invalid AI message format</div>;
    }
  
    return (
      <div className='aidiv overflow-auto bg-gray-900 rounded-lg p-2'>
        
        <Markdown
        
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }
  
  return (
    <main className="h-screen w-screen flex bg-gray-900 text-gray-100">
      <section className="left relative flex flex-col h-screen min-w-[28vw] bg-gray-800">
        <header className="flex justify-between p-4 w-full bg-gray-700">
          <motion.button
            className="p-2 flex items-center gap-2 text-gray-100 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setIsAddUserModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-add-fill text-xl"></i>
            <p className="text-sm font-semibold">Add Collaborator</p>
          </motion.button>
          <motion.button
            className="p-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors duration-200"
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-group-fill text-xl"></i>
          </motion.button>
        </header>
        <div className="conversation-area flex-grow pt-4 flex flex-col overflow-auto">
          <div ref={messageBoxRef}
           className="message-box max-w-[28vw] flex-grow flex flex-col gap-2 p-4 overflow-y-auto">
            {project.messages &&
              project.messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`message max-w-xs md:max-w-sm p-3 rounded-lg ${
                    msg.sender._id === user._id.toString() ? "ml-auto bg-blue-600 text-white " : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="text-xs opacity-75 mb-1">{msg.sender.email}</p>
                  {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p className="text-sm">{msg.message}</p>}
                
                </motion.div>
              ))}
          </div>
          <div className="inputField w-full flex p-4 bg-gray-700">
            <input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              className="p-2 px-4 w-full bg-gray-600 text-gray-100 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Enter a message"
              onKeyPress={(e) => e.key === "Enter" && sendMessageToProject()}
            />
            <motion.button
              onClick={sendMessageToProject}
              className="send px-6 bg-blue-600 rounded-r-md hover:bg-blue-700 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="ri-send-plane-2-fill text-2xl"></i>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isSidePanelOpen && (
            <motion.div
              className="sidePanel min-w-96 md:w-80 h-full flex flex-col gap-2 absolute top-0 right-0 bg-gray-800 shadow-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <header className="flex justify-between p-4 w-full bg-gray-700 items-center">
                <h1 className="text-lg font-bold">Collaborators</h1>
                <motion.button
                  className="p-2"
                  onClick={() => setIsSidePanelOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="ri-close-fill text-2xl"></i>
                </motion.button>
              </header>
              <div className="users flex flex-col gap-2 p-4 overflow-y-auto">
                {project.users &&
                  project.users.map((user) => (
                    <motion.div
                      key={user._id}
                      className="user flex gap-3 items-center p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="aspect-square h-10 w-10 rounded-full bg-blue-600 flex justify-center items-center">
                        <i className="ri-user-fill text-xl text-white"></i>
                      </div>
                      <p className="text-sm flex-grow">{user.email}</p>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddUserModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Add Collaborators</h2>
                    <motion.button
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="text-gray-400 hover:text-gray-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="ri-close-line text-2xl"></i>
                    </motion.button>
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        onClick={() => handleUserSelect(user._id)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.includes(user._id)
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{user.email}</p>
                        </div>
                        {selectedUsers.includes(user._id) && <i className="ri-check-line text-white text-xl"></i>}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-700">
                  <motion.button
                    onClick={addCollaborator}
                    disabled={selectedUsers.length === 0}
                    className={`w-full py-2 rounded-lg text-white font-medium ${
                      selectedUsers.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    whileHover={selectedUsers.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={selectedUsers.length > 0 ? { scale: 0.98 } : {}}
                  >
                    Add Selected Users ({selectedUsers.length})
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className="right relative flex flex-grow h-screen min-w-[72vw] bg-gray-900">
        <div className="explorer h-full max-w-64 min-w-52  bg-red-500">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file,index) => (
              <button 
              key={index}
              onClick={() => {
                setCurrentFile(file)
                setOpenFiles([...new Set([...openFiles, file])])
              }} 
              className="tree-elment cursor-pointer flex gap-2 items-center p-2 px-4 bg-gray-800">
                <p className=" font-semibold text-lg">{file}</p>
              </button>
            ))}
          </div>
        </div>
      
          <div className="code-editor h-full flex flex-col flex-grow">
            <div className="top flex w-full justify-between items-center align-center bg-gray-800">
             <div className="files flex">
          {openFiles.map((file,index) => (
            <button
            key={index}
            onClick={() => setCurrentFile(file)}
            className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
            <p
                className='font-semibold text-lg'
            >{file}</p>
        </button>
          ))}
              </div>
              <div className="actions">
                <button
                onClick={
                  async()=>{
                    await webContainer?.mount(fileTree)
               const installProcess =  await webContainer?.spawn("npm",["install"])
               installProcess.output.pipeTo(new WritableStream({
                write(chunk){
                  console.log(chunk)
                }
               }))

               if(runProcess){
                runProcess.kill()
               }

               let tempRunProcess =  await webContainer?.spawn("npm",["start"])
               tempRunProcess.output.pipeTo(new WritableStream({
                write(chunk){
                  console.log(chunk)
                }
               }))
               setRunProcess(tempRunProcess)
               
                webContainer.on('server-ready',(port,url)=>{
                  console.log(port,url)
                  setIframeUrl(url)
                })

                }
              }
                className="p-2 px-4 bg-gray-700 text-white"
                >Run</button>
              </div>
            </div>
            <div className="bottom h-full flex flex-grow">
            {
             fileTree[currentFile] && (
         <div className="code-editor-area w-full h-full overflow-auto flex-grow bg-gray-800 text-gray-100 p-4">
             <pre className="hljs h-full">
              <code
                className="hljs h-full outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const updatedContent = e.target.innerText;
                  setFileTree((prevFileTree) => ({
                    ...prevFileTree,
                    [currentFile]: {
                      ...prevFileTree[currentFile],
                      file: {
                        ...prevFileTree[currentFile].file,
                        contents: updatedContent,
                      },
                    },
                  }));
                }}
                dangerouslySetInnerHTML={{
                  __html: hljs.highlight(fileTree[currentFile].file.contents, { language: 'javascript', ignoreIllegals: true }).value,
                }}
                style={{
                  whiteSpace: 'pre-wrap',
                  paddingBottom: '25rem',
                  counterSet: 'line-numbering',
                  backgroundColor: 'transparent',
                }}
              />
            </pre>
         </div>
             )
             }
            </div>
          </div>
          {iframeUrl && webContainer && (
            <div className="flex flex-col h-full min-w-96 ">
               <div className="address-bar">
                <input 
                type="text" value={iframeUrl} 
                onChange={(e)=>{
                  setIframeUrl(e.target.value)
                }}
                className="w-full h-full bg-gray-800 text-gray-100"></input>
               </div>
              <iframe src={iframeUrl} className="w-full  h-full"></iframe>
            </div>
          )}
      </section>
    </main>
  )
}

export default Project
