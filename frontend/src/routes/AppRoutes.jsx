import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import ProjectDetails from '../screens/Project';
import UserAuth from '../auth/UserAuth';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuth><Home /></UserAuth>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/project" element={<UserAuth><ProjectDetails /></UserAuth>} />

      </Routes>
    </BrowserRouter>    
  )
}

export default AppRoutes
