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
import api from './../../../../api'; 

const ProductForm = ({ onProductAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [suppliersId, setSuppliersId] = useState([]);
  const [expirationDate, setExpirationDate] = useState('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const productData = {
      name,
      description,
      unitPrice: parseFloat(unitPrice),
      categoryId,
      suppliersId,
      expirationDate,
    };

    try {
      const response = await api.post('/products', productData); 
      if (response.status === 201) {
        setSnackbarMessage('Produto cadastrado com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (typeof onSupplierAdded === 'function') {
          onProductAdded(response.data.content);
        } else {
          console.error('onSupplierAdded is not a function');
        }
   
        setName('');
        setDescription('');
        setUnitPrice('');
        setCategoryId('');
        setSuppliersId([]);
        setExpirationDate('');
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
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item md={6}>
              <TextField
                label="Nome"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
            </Grid>
            <Grid item md={6}>
              <TextField
                label="Preço Unitário"
                type="number"
                fullWidth
                variant="outlined"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
                sx={{ mb: 2 }} // Espaçamento abaixo
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
            </Grid>
            <Grid item md={12}>
              <TextField
                label="Descrição"
                fullWidth
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
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
            </Grid>
            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <CategoryIcon sx={{ mr: 1 }} />
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Fornecedores</InputLabel>
                <Select
                  multiple
                  value={suppliersId}
                  onChange={(e) => setSuppliersId(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      <Checkbox checked={suppliersId.indexOf(supplier.id) > -1} />
                      <ListItemText primary={supplier.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <TextField
                label="Data de Expiração"
                type="date"
                fullWidth
                variant="outlined"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
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
