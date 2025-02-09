import React, { useState, useEffect, useContext, useRef } from "react"
import { useLocation } from "react-router-dom"
import axios from "../config/Axios"
import { initializeSocket, sendMessage, receiveMessage } from "../config/Socket"
import { UserContext } from "../context/user.context"
import { motion, AnimatePresence } from "framer-motion"

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

  useEffect(() => {
    getProject()
    initializeSocket(project._id)
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
  }, [project.messages])

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

  const appendIncomingMessage = (messageObject) => {
    setProject((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), messageObject],
    }))
    scrolltoBottom()
  }

  const appendOutgoingMessage = (messageObject) => {
    setProject((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), messageObject],
    }))
    scrolltoBottom()
  }
 
  const scrolltoBottom = () => {  
    messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight  
  }

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <main className="h-screen w-screen flex bg-gray-900 text-gray-100">
      <section className="left relative flex flex-col h-screen min-w-96 bg-gray-800">
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
           className="message-box flex-grow flex flex-col gap-2 p-4 overflow-y-auto">
            {project.messages &&
              project.messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`message max-w-xs md:max-w-sm p-3 rounded-lg ${
                    msg.sender._id === user._id ? "ml-auto bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="text-xs opacity-75 mb-1">{msg.sender.email}</p>
                  <p className="text-sm">{msg.message}</p>
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
    </main>
  )
}

export default Project

