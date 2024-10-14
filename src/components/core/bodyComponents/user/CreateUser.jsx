import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { AccountCircle, Email, Lock, Save } from '@mui/icons-material';
import api from '../../../../api';
import { useForm, Controller } from 'react-hook-form';

const CreateUser = ({ onUserAdded }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success'); // Adicionando snackbarSeverity

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/register/user', {
        username: data.username,
        email: data.email,
        password: data.password,
        role: "USER",
        status: "ACTIVE",
      });

      if (response.status === 200) {
        if (typeof onUserAdded === 'function') {
          onUserAdded(response.data); 
        } else {
          console.error('onUserAdded is not a function');
        }

        setSnackbarMessage('Usuário criado com sucesso!');
        setSnackbarSeverity('success'); 
        setSnackbarOpen(true);
        reset(); 
      } 
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Erro ao criar usuário');
      setSnackbarSeverity('error'); 
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AccountCircle sx={{ mr: 1 }} />
          Criar Novo Usuário
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="username"
            control={control}
            defaultValue=""
            rules={{ required: 'O nome de usuário é obrigatório.', minLength: { value: 3, message: 'O nome de usuário deve ter pelo menos 3 caracteres.' } }}
            render={({ field }) => (
              <TextField
                label="Nome de Usuário"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ''}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: 'O e-mail é obrigatório.', pattern: { value: /\S+@\S+\.\S+/, message: 'O e-mail deve ser válido.' } }}
            render={({ field }) => (
              <TextField
                label="E-mail"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ''}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: 'A senha é obrigatória.', minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres.' } }}
            render={({ field }) => (
              <TextField
                label="Senha"
                type="password"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ''}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <Save sx={{ mr: 1 }} />
            Criar Usuário
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateUser;
