import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email, Lock } from '@mui/icons-material';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../../../context/AuthContext'; 

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:1200px)');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password); 
      navigate('/home');
    } catch (err) {
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" bgcolor="#e0f2f1" px={isMobile ? 2 : isTablet ? 4 : 8}>
      <Box bgcolor="#ffffff" p={isMobile ? 4 : 6} borderRadius={4} boxShadow={3} width={isMobile ? '90%' : isTablet ? '400px' : '500px'}>
        <Typography variant="h5" mb={2} textAlign="center" color="#00796b" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          <LoginIcon sx={{ marginRight: 1, fontSize: '2rem', color: '#00796b' }} />
          Acesse sua conta
        </Typography>
        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            fullWidth
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#00796b' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              input: { color: '#00796b' },
              fieldset: { borderColor: '#00796b' },
              mb: 2,
            }}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            margin="normal"
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#00796b' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              input: { color: '#00796b' },
              fieldset: { borderColor: '#00796b' },
              mb: 2,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: '#00796b',
              '&:hover': {
                bgcolor: '#004d40',
                transition: 'background-color 0.3s ease',
              },
              padding: '12px',
              fontSize: '1rem',
            }}
          >
            Entrar
          </Button>
        </form>

        <Typography textAlign="center" mt={3} color="#00796b">
          Ainda não tem uma conta?{' '}
          <Link href="/register" underline="hover" color="#00796b">
            Registre-se aqui
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
