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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
} from '@mui/material';
import { AddCircleOutline, Inventory2, Warehouse } from '@mui/icons-material';
import api from './../../../../api';
import QrScanner from 'react-qr-scanner';

const InventoryForm = ({ onInventoryAdded }) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
  const [location, setLocation] = useState('');
  const [products, setProducts] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isScanning, setIsScanning] = useState(false); 
  const [openModal, setOpenModal] = useState(false); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        console.log(response.data.content);
        setProducts(Array.isArray(response.data.content) ? response.data.content : []);
      } catch (error) {
        setSnackbarMessage('Erro ao carregar produtos: ' + (error.response?.data?.message || 'Erro desconhecido.'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
        setSnackbarMessage('Inventário cadastrado com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (typeof onInventoryAdded === 'function') {
          onInventoryAdded(response.data);
        } else {
          console.error('onInventoryAdded is not a function');
        }

        setProductId('');
        setQuantity('');
        setDiscount('');
        setLocation('');
      }
    } catch (error) {
      setSnackbarMessage('Erro ao cadastrar inventário: ' + (error.response?.data?.message || 'Erro desconhecido.'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleScan = (data) => {
    if (data) {
      console.log(data);
      setLocation(data.text); 
      setOpenModal(false); 
    }
  };

  const handleError = (err) => {
    console.error(err); 
  };

  const openCameraModal = () => {
    setOpenModal(true);
    setIsScanning(true);
  };

  const closeCameraModal = () => {
    setOpenModal(false);
    setIsScanning(false);
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={openCameraModal}>Escanear QR</Button>
                    </InputAdornment>
                  ),
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

      <Dialog open={openModal} onClose={closeCameraModal}>
        <DialogTitle>Escanear QR Code</DialogTitle>
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          {isScanning && (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          )}
          <Button onClick={closeCameraModal} variant="outlined" sx={{ mt: 2 }}>
            Cancelar
          </Button>
        </Box>
      </Dialog>

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

export default InventoryForm;