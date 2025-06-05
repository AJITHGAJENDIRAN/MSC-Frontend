import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; 

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const logInUser = () => {
        if (!email) {
            alert("Email cannot be empty!");
            return;
        }
        if (!password) {
            alert("Password cannot be empty!");
            return;
        }

        axios.post('http://172.16.21.6:5000/login', {
            email,     // this matches backend
            password
          })
            .then((response) => {
                console.log(response);
                // Store the authentication token
                localStorage.setItem('token', response.data.token);
                // Redirect to dashboard after successful login
                navigate("/dashboard");
            })
            .catch((error) => {
                console.error(error);
                if (error.response?.status === 401) {
                    alert("Invalid credentials");
                }
            });
    };

    return (
        <div className="login-container">
            <div className="background">
                <img src="/images/bg.jpg" alt="Background" className="background-image" />
            </div>
            <div className="login-box">
                <h2>Welcome to ViswaGroup</h2>
                <p>Log into your account</p>

                <div className="form-group">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="form-control" placeholder="Enter your email" />
                </div>

                <div className="form-group">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="form-control" placeholder="Enter password" />
                </div>

                <button onClick={logInUser} className="btn btn-primary">Login</button>

                <p className="register-text">
                    Don't have an account? <a href="/register" className="register-link">Register</a>
                </p>
            </div>
        </div>
    );
}
