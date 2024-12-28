import React, { useContext } from 'react'
import { UserContext } from '../context/user.context'

const Home = () => {
  const { user } = useContext(UserContext);
  return (
    <div className='text-black'>{JSON.stringify(user)}</div>
  )
}

export default Home