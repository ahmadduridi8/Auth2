import axios from 'axios';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login({ setuserData }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: LoginUser,
  });

  async function LoginUser() {
    try {
      const response = await axios.post(
        'https://cms-prod.menta-lb.com/auth/login',
        {
          username: formik.values.username,
          password: formik.values.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        }
      );
      const data = response.data;
      if (data.message === 'valid') {
        localStorage.setItem('userToken', data.token);
        navigate('/Card', { state: { userData: data.token } });
      } else {
        console.error('Invalid login response:', data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={formik.handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            className="input-field"
            onChange={formik.handleChange}
            value={formik.values.username}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            className="input-field"
            onChange={formik.handleChange}
            value={formik.values.password}
            required
          />
        </div>
        <button type="submit" className="login-button" to={'/Card'}>Login</button>
      </form>
    </div>
  );
}
