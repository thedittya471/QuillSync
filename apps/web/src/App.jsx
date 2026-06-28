
import Singup from './auth/Signup/signup.jsx';
import Landing from "./pages/Landing";
import { Routes,Route } from 'react-router-dom';

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Singup />} />
      </Routes>
    );
  };
