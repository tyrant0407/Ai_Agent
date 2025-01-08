import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/Axios.js';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/projects/create', {
        name: projectName,
        description: projectDescription,
      });
      setIsModalOpen(false);
      setProjectName('');
      setProjectDescription('');
      setProjects((prev) => [...prev, res.data.project]);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/projects/all');
        console.log(res.data.projects);
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main className="p-4 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#727272bb] text-white rounded-lg hover:bg-[#727272] transition-all duration-300"
          >
            <i className="ri-add-line mr-2"></i>
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.length === 0 ? (
            <div className="text-white col-span-full">No projects found</div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj._id}
                className="bg-[#2c2c2cbb] p-4 rounded-lg cursor-pointer hover:bg-[#3c3c3c] transition-all duration-300"
                onClick={() => navigate(`/project`,{state:{project:proj}})}
              >
                <h2 className="text-white text-xl font-semibold">{proj.name.toUpperCase()}</h2>
                {/* <p className="text-gray-300 mt-2 truncate">{proj.description}</p> */}

                <i
                  style={{ fontFamily: 'mono' }}
                  className="ri-user-line text-gray-300 mt-2 truncate"
                >
                  <span className="text-gray-300 inline-block font-light">
                    Collaborators: {proj.users.length}
                  </span>
                </i>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Project Modal */}
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
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
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
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
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
  );
};

export default Home;

