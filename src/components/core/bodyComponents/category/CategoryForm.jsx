// CategoryForm.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';
import { AddCircleOutline, CategoryOutlined, ClassOutlined } from '@mui/icons-material';
import api from './../../../../api'; 

const CategoryForm = ({ onCategoryAdded }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const categoryData = {
      name,
    };

    try {
      const response = await api.post('/category', categoryData);
      if (response.status === 201) {
        alert('Categoria cadastrada com sucesso!');
        
        onCategoryAdded(response.data); 

        setName(''); 
      }
    } catch (error) {
      alert('Erro ao cadastrar categoria: ' + error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <ClassOutlined sx={{ mr: 1 }} />
          Cadastrar Categoria
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nome da Categoria"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryOutlined />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }} 
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Categoria
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CategoryForm;
