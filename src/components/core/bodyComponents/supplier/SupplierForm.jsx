import React, { useState } from 'react';
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

const SupplierForm = ({ onSupplierAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!name || name.length < 3) {
      newErrors.name = 'O nome deve ter pelo menos 3 caracteres.';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'O e-mail deve ser válido.';
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'O telefone deve ter pelo menos 10 dígitos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const supplierData = {
      name,
      email,
      phone,
    };

    try {
      const response = await api.post('/supplier', supplierData);
      if (response.status === 201) {
        if (typeof onSupplierAdded === 'function') {
          onSupplierAdded(response.data); 
        } else {
          console.error('onSupplierAdded is not a function');
        }
        setSnackbarMessage('Fornecedor cadastrado com sucesso!');
        setSnackbarOpen(true);

        setName('');
        setEmail('');
        setPhone('');
        setErrors({});
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
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="E-mail"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined />
                </InputAdornment>
              ),
            }}
          />
          <InputMask
            mask="(99) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          >
            {() => (
              <TextField
                label="Telefone"
                fullWidth
                variant="outlined"
                error={!!errors.phone}
                helperText={errors.phone}
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
