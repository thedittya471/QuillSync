
import Singup from './auth/Signup/signup.jsx';
import { Routes,Route } from 'react-router-dom';

export default function App() {
  return (
      <Routes>
        <Route path="/signup" element={<Singup />} />
      </Routes>
    );
