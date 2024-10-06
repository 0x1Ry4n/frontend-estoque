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
  Paper,
  Grid,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  AddCircleOutline
} from '@mui/icons-material';
import api from './../../../../api';

const OrderForm = ({ onOrderAdded }) => {
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  useEffect(() => {
    const fetchInventories = async () => {
      if (productId) {
        try {
          const response = await api.get(`/products/${productId}/inventory`);
          if (Array.isArray(response.data)) {
            setInventories(response.data);
          } else if (response.data) {
            setInventories([response.data]); // Se não for array, converta para array
          } else {
            setInventories([]); // Defina como array vazio se não houver dados
          }
        } catch (error) {
          console.error('Erro ao buscar inventário:', error);
          setInventories([]); // Trate o erro definindo como array vazio
        }
      } else {
        setInventories([]); // Limpe o inventário se nenhum produto estiver selecionado
      }
    };
  
    fetchInventories();
  }, [productId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (quantity <= 0) {
      setErrorMessage('A quantidade deve ser maior que zero.');
      return;
    }

    const orderData = {
      customerId,
      productId,
      inventoryId,
      quantity,
      paymentMethod,
      status,
    };

    try {
      const response = await api.post('/orders', orderData);
      if (response.status === 201) {
        setSuccessMessage('Pedido cadastrado com sucesso!');
        onOrderAdded(response.data.content);

        setCustomerId('');
        setProductId('');
        setInventoryId('');
        setQuantity(1);
        setPaymentMethod('');
        setStatus('');
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
      <AddCircleOutline sx={{ mr: 1 }} /> Cadastrar Pedido
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {loading && <CircularProgress />}
          <Grid container spacing={4}>
            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>Cliente</InputLabel>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.fullname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>Produto</InputLabel>
                <Select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Inventário</InputLabel>
              <Select value={inventoryId} onChange={(e) => setInventoryId(e.target.value)} required>
                {Array.isArray(inventories) && inventories.length > 0 ? (
                  inventories.map((inventory) => (
                    <MenuItem key={inventory.id} value={inventory.id}>
                      {inventory.id} - {inventory.quantity} em estoque
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    Nenhum inventário disponível
                  </MenuItem>
                )}
              </Select>
            </FormControl>
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
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>Método de Pagamento</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
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
                <InputLabel>Status do Pedido</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
          message={errorMessage || successMessage}
        />
      </Paper>
    </Box>
  );
};

export default OrderForm;
