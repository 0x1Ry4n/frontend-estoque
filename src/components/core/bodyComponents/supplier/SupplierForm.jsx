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
import { AddCircleOutline, PersonOutline, EmailOutlined, PhoneOutlined } from '@mui/icons-material';
import InputMask from 'react-input-mask'; // Importe a biblioteca
import api from './../../../../api';
import { useForm, Controller } from 'react-hook-form';

const SupplierForm = ({ onSupplierAdded }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/supplier', data);
      if (response.status === 201) {
        if (typeof onSupplierAdded === 'function') {
          onSupplierAdded(response.data); 
        } else {
          console.error('onSupplierAdded is not a function');
        }

        setSnackbarMessage('Fornecedor cadastrado com sucesso!');
        setSnackbarOpen(true);
        reset(); // Limpa o formulário após o envio
      } else {
        setSnackbarMessage('Erro ao cadastrar fornecedor: ' + response.data.message);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.log(error);
      setSnackbarMessage('Erro ao cadastrar fornecedor');
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
          <PersonOutline sx={{ mr: 1 }} />
          Cadastrar Fornecedor
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: 'O nome é obrigatório.', minLength: { value: 3, message: 'O nome deve ter pelo menos 3 caracteres.' } }}
            render={({ field }) => (
              <TextField
                label="Nome"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline />
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
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            rules={{ required: 'O telefone é obrigatório.' }}
            render={({ field }) => (
              <InputMask
                mask="(99) 99999-9999"
                value={field.value}
                onChange={field.onChange}
                required
              >
                {() => (
                  <TextField
                    label="Telefone"
                    fullWidth
                    variant="outlined"
                    error={!!errors.phone}
                    helperText={errors.phone ? errors.phone.message : ''}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            )}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Fornecedor
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes('Erro') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupplierForm;
