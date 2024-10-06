// InventoryForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { AddCircleOutline, Inventory2, Warehouse } from '@mui/icons-material';
import api from './../../../../api';

const InventoryForm = ({ onInventoryAdded }) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
  const [location, setLocation] = useState('');
  const [products, setProducts] = useState([]); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products'); // Aponte para o endpoint correto
        console.log(response.data.content); // Verifique o que está sendo retornado pela API
        setProducts(Array.isArray(response.data.content) ? response.data.content : []); // Garante que é um array
      } catch (error) {
        alert('Erro ao carregar produtos: ' + error.response?.data?.message || 'Erro desconhecido.');
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const inventoryData = {
      quantity: parseInt(quantity, 10),
      discount: parseFloat(discount),
      location,
    };

    try {
      const response = await api.post(`/products/${productId}/inventory`, inventoryData);
      if (response.status === 201) {
        alert('Inventário cadastrado com sucesso!');

        onInventoryAdded(response.data);

        // Limpar os campos do formulário
        setProductId('');
        setQuantity('');
        setDiscount('');
        setLocation('');
      }
    } catch (error) {
      alert('Erro ao cadastrar inventário: ' + error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Inventory2 sx={{ mr: 1 }} />
          Cadastrar Inventário
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Produto</InputLabel>
                <Select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  {products.length > 0 ? (
                    products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        <Warehouse sx={{ mr: 1 }} />
                        {product.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No products available</MenuItem> 
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                label="Quantidade"
                fullWidth
                variant="outlined"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddCircleOutline />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                label="Desconto"
                fullWidth
                variant="outlined"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddCircleOutline />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                label="Localização"
                fullWidth
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Inventário
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InventoryForm;
