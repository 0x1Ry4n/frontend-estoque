import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  Paper,
  Grid,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import api from './../../../../api';

const OrderForm = ({ onOrderAdded }) => {
  const [customerId, setCustomerId] = useState(null);
  const [productId, setProductId] = useState(null);
  const [inventoryId, setInventoryId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [status, setStatus] = useState('DELIVERED');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch customers and products
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/customer');
        setCustomers(response.data.content);
      } catch (error) {
        setErrorMessage('Erro ao buscar clientes.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products');
        setProducts(response.data.content);
      } catch (error) {
        setErrorMessage('Erro ao buscar produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  const handleProductChange = async (event, newValue) => {
    if (newValue) {
      setProductId(newValue); // O novo valor é o objeto do produto
      setInventoryId(null); // Reset inventory when changing product

      try {
        // Use newValue.id para acessar o id do produto
        const response = await api.get(`/products/${newValue.id}/inventory`);
        if (Array.isArray(response.data)) {
          setInventories(response.data);
          if (response.data.length > 0) {
            setInventoryId(response.data[0]); // Seleciona o primeiro inventário
          } else {
            setInventoryId(null); // Nenhum inventário disponível
          }
        } else {
          setInventories([]); // Se não for uma lista, reseta
        }
      } catch (error) {
        console.error('Erro ao buscar inventário:', error);
        setInventories([]); // Limpa a lista de inventários em caso de erro
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (quantity <= 0) {
      setErrorMessage('A quantidade deve ser maior que zero.');
      return;
    }

    const orderData = {
      customerId: customerId?.id,
      productId: productId?.id,
      inventoryId: inventoryId?.id,
      quantity,
      paymentMethod,
      status,
    };

    try {
      const response = await api.post('/orders', orderData);
      if (response.status === 201) {
        setSuccessMessage('Pedido cadastrado com sucesso!');
        if (typeof onOrderAdded === 'function') {
          onOrderAdded(response.data.content);
        }
        setCustomerId(null);
        setProductId(null);
        setInventoryId(null);
        setQuantity(1);
        setPaymentMethod('CREDIT_CARD'); // Reset to default value
        setStatus('DELIVERED'); // Reset to default value
        setInventories([]);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  const handleSnackbarClose = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AddCircleOutline sx={{ mr: 1 }} />
          Cadastrar Pedido
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {loading && <CircularProgress />}
          <Grid container spacing={4}>
            <Grid item md={6}>
              <Autocomplete
                value={customerId}
                onChange={(event, newValue) => setCustomerId(newValue)}
                options={customers}
                getOptionLabel={(option) => option.fullname || ''}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" variant="outlined" required />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Autocomplete
                value={productId}
                onChange={handleProductChange}
                options={products}
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => (
                  <TextField {...params} label="Produto" variant="outlined" required />
                )}
              />
            </Grid>

            <Grid item md={6}>
              <Autocomplete
                value={inventoryId}
                onChange={(event, newValue) => setInventoryId(newValue)}
                options={inventories}
                getOptionLabel={(option) =>
                  `${option.location} (${option.quantity} disponíveis)`
                }
                renderInput={(params) => (
                  <TextField {...params} label="Inventário" variant="outlined" required />
                )}
                disabled={!productId} // Disable if no product is selected
              />
            </Grid>

            <Grid item md={6}>
              <TextField
                label="Quantidade"
                type="number"
                fullWidth
                variant="outlined"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pagamento</Typography>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  variant="outlined"
                  required
                >
                  <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
                  <MenuItem value="DEBIT_CARD">Cartão de Débito</MenuItem>
                  <MenuItem value="MONEY">Dinheiro</MenuItem>
                  <MenuItem value="ANY">Qualquer um</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Status de Entrega</Typography>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  variant="outlined"
                  required
                >
                  <MenuItem value="PENDING">Pendente</MenuItem>
                  <MenuItem value="IN_PROGRESS">Em Progresso</MenuItem>
                  <MenuItem value="DELIVERED">Entregue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4 }}>
            Cadastrar Pedido
          </Button>
        </Box>

        <Snackbar
          open={!!errorMessage || !!successMessage}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={errorMessage ? 'error' : 'success'} sx={{ width: '100%' }}>
            {errorMessage || successMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default OrderForm;
