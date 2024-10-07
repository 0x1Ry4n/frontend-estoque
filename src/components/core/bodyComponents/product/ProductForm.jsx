import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Paper,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  PriceCheck as PriceCheckIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon,
  AddShoppingCart as AddShoppingCartIcon,
  AddCircleOutline,
} from '@mui/icons-material';
import InputMask from 'react-input-mask'; // Importe a biblioteca
import api from './../../../../api';
import { useForm, Controller } from 'react-hook-form';

const ProductForm = ({ onProductAdded }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get('/category'); 
      setCategories(response.data.content);
    };

    const fetchSuppliers = async () => {
      const response = await api.get('/supplier'); 
      setSuppliers(response.data.content);
    };

    fetchCategories();
    fetchSuppliers();
  }, []);

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        unitPrice: parseFloat(data.unitPrice), // Certifique-se de que o preço é um número
      };

      const response = await api.post('/products', productData); 
      if (response.status === 201) {
        setSnackbarMessage('Produto cadastrado com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (typeof onProductAdded === 'function') {
          onProductAdded(response.data.content);
        } else {
          console.error('onProductAdded is not a function');
        }
   
        reset(); // Limpa o formulário após o envio
      }
    } catch (error) {
      setSnackbarMessage('Erro ao cadastrar produto: ' + (error.response?.data?.message || 'Erro desconhecido.'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AddShoppingCartIcon sx={{ mr: 1 }} />
          Cadastrar Produto
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item md={6}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'O nome é obrigatório.' }}
                render={({ field }) => (
                  <TextField
                    label="Nome"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name ? errors.name.message : ''}
                    sx={{ mb: 2 }} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AddIcon />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Controller
                name="unitPrice"
                control={control}
                defaultValue=""
                rules={{ required: 'O preço unitário é obrigatório.' }}
                render={({ field }) => (
                  <TextField
                    label="Preço Unitário"
                    type="number"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.unitPrice}
                    helperText={errors.unitPrice ? errors.unitPrice.message : ''}
                    sx={{ mb: 2 }} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriceCheckIcon />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item md={12}>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                rules={{ required: 'A descrição é obrigatória.' }}
                render={({ field }) => (
                  <TextField
                    label="Descrição"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.description}
                    helperText={errors.description ? errors.description.message : ''}
                    sx={{ mb: 2 }} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>Categoria</InputLabel>
                <Controller
                  name="categoryId"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'A categoria é obrigatória.' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      required
                      error={!!errors.categoryId}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <CategoryIcon sx={{ mr: 1 }} />
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.categoryId && <p style={{ color: 'red' }}>{errors.categoryId.message}</p>}
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Fornecedores</InputLabel>
                <Controller
                  name="suppliersId"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Select
                      multiple
                      {...field}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          <Checkbox checked={field.value.indexOf(supplier.id) > -1} />
                          <ListItemText primary={supplier.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <Controller
                name="expirationDate"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    label="Data de Expiração"
                    type="date"
                    fullWidth
                    variant="outlined"
                    {...field}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mb: 2 }} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Produto
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductForm;
