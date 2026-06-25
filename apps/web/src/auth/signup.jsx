import {useState} from 'react';
import '../styles/Signup.css';
import { UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Signup(){
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    function checkPasswordStrength(password) {
        return(
        password.length===0?<div className='flex justify-between'> {/*If password is empty*/}
        <p class='text-red-500'> # At least one digit</p>
        <p class='text-red-500'># At least 8 characters long</p>
        </div>

        :password.length<8? 
        /\d/.test(password)? <p class='text-red-500'># Password must be at least 8 characters long</p>:
        <div className='flex justify-between'>
        <p class='text-red-500'># At least one digit</p>
         <p class='text-red-500'># At least 8 characters long</p>
        </div>:

        /\d/.test(password)?'':<p class='text-red-500'># Password must contain at least one number</p> 

    )}



    return (
    <div className='border-1 px-15 pt-5 pb-3 h-full shadow-gray-600 shadow-lg  rounded-2xl w-2xl mt-5 m-auto'>
        
        <div>
            <UserPlus className='mx-auto text-indigo-600 bg-indigo-300 p-4 rounded-full' size={70}/>
            <h1 className='text-center text-4xl mt-3 font-bold text-gray-800'><span className='text-indigo-700'>Create</span> Account</h1>
            <h4 className='text-gray-500 mt-2 text-center'>Join QuillSync today and start your journey today</h4>
        </div>

        <form action='/api/auth/register' className='flex flex-col gap-4' method='POST'>

        <label for='name' className='label-class'>Name:</label>
        <input type='text' id='name' name='name' className='input-class' placeholder='Name' required />

        <label for='email' className='label-class'>Email:</label>
        <input type='email' id='email' name='email' className='input-class' placeholder='Email' required />

        <label for='password' className='label-class'>Password:</label>
        <input type='password' id='password' name='password' className='input-class' placeholder='Password' required onChange={e=>setPassword(e.target.value)}/>

        {/* The below logic is to check wether the password matched the condition or not?*/}
        {checkPasswordStrength(password)}

        <label for='confirm-password' className='label-class'>Confirm Password:</label>
        <input type='password' id='confirm-password' name='confirm-password' className='input-class' placeholder='Confirm Password' required onChange={e=>setConfirmPassword(e.target.value)}/>

        {password!==confirmPassword? <p className='text-red-500 mb-0 mt-1'>Passwords do not match</p>:''}

        <button type='submit' disabled={password!==confirmPassword || password.length===0} className={`${password===confirmPassword && password!==''? 'bg-indigo-600 opacity-100' : 'bg-gray-400 opacity-60'} text-white rounded-4xl text-2xl px-6 py-2 cursor-pointer mt-3 mb-0 ${password===confirmPassword && password!=''? 'hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-95':''}`}>
            Create Account</button>

        <hr></hr>

        </form>
    
        <button className='bg-blue-500 rounded-4xl w-full mt-4 py-2 text-white text-2xl text-center cursor-pointer hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-95'>
            <FcGoogle className='inline-block mr-2 bg-white rounded-4xl p-1' size={30}/> Sign up with
            Google</button>

        <p className='text-center mt-2'>Already have an account ? <a href='/signin' className='text-indigo-700  text-'>Sign in</a></p>

    </div>
    )
}