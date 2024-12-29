import React, { useContext, useState } from 'react'
import { UserContext } from '../context/user.context'


const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });

  function createProject(e) {
    e.preventDefault();
    // Handle project creation here
    setIsModalOpen(false);
  }

  return (
   <main className='p-4 h-screen w-screen bg-black'>
    <div className='projects-container'>
      <div className='project flex items-center gap-2'>
        {/* Creation Icon */}
        <i   onClick={() => setIsModalOpen(true)} className='ri-link text-xl text-white'></i>
      </div>
    </div>
    
    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Create New Project</h2>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                placeholder="Enter project description"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Project
            </button>
          </form>
        </div>
      </div>
    )}
   </main>
  )
}

export default Home