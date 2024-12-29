import React, { useContext, useState } from 'react'
import { UserContext } from '../context/user.context';
import axios from '../config/Axios.js';


const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ProjetName, setProjetName] = useState('');
  const [ProjetDescription, setProjetDescription] = useState('');

  function createProject(e) {
    e.preventDefault();
    // Handle project creation here
    console.log({ProjetName, ProjetDescription});
    axios.post('/projects/create', {
      name: ProjetName,
      description: ProjetDescription,
    }).then((res) => {
      console.log(res);
      setIsModalOpen(false);
      setProjetName('');
      setProjetDescription('');
    }).catch((err) => {
      console.log(err);
    })
   
  }

  return (
   <main className='p-4 h-screen w-screen bg-black'>
    <div className='projects-container'>
      <div className='project flex items-center gap-2'>
        {/* Creation Icon */}
        <i   onClick={() => setIsModalOpen(true)} className='ri-link text-xl text-white p-2 bg-[#727272bb] rounded-lg hover:bg-[#727272] transition-all duration-300 cursor-pointer border-2  border-[#727272]'> <span className='text-white font-mono'>New Project</span></i>
      </div>
    </div>
    
    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#2c2c2cbb] rounded-xl p-6 w-full max-w-md">
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
                value={ProjetName}
                onChange={(e) => setProjetName(e.target.value)}
                className="w-full px-3 py-2 bg-[#2c2c2cbb] text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={ProjetDescription}
                onChange={(e) => setProjetDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#2c2c2cbb] text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                placeholder="Enter project description"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black hover:bg-[#69ee91] duration-500 hover:text-black text-white font-medium rounded-lg transition-colors"
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