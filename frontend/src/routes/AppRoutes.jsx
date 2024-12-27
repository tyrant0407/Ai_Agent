import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../screen/Login';
import Register from '../screen/Register';
import Home from '../screen/Home';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>    
  )
}

export default AppRoutes
