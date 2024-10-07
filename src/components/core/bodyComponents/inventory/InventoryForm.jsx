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
import { useForm, Controller } from 'react-hook-form'; // Importação do react-hook-form
import api from './../../../../api'; // Import API
import QrScanner from 'react-qr-scanner'; // Import QR Scanner

const InventoryForm = ({ onInventoryAdded }) => {
  // States auxiliares
  const [products, setProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isScanning, setIsScanning] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Hook do react-hook-form
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      productId: '',
      quantity: '',
      discount: '',
      location: '',
    },
  });

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

  const onSubmit = async (data) => {
    try {
      const response = await api.post(`/products/${data.productId}/inventory`, {
        quantity: parseInt(data.quantity, 10),
        discount: parseFloat(data.discount),
        location: data.location,
      });
      if (response.status === 201) {
        setSnackbarMessage('Inventário cadastrado com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (typeof onInventoryAdded === 'function') {
          onInventoryAdded(response.data);
        }

        reset(); // Reseta o formulário após submissão
      }
    } catch (error) {
      setSnackbarMessage('Erro ao cadastrar inventário: ' + (error.response?.data?.message || 'Erro desconhecido.'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleScan = (data) => {
    if (data) {
      console.log(data);
      reset({ location: data.text }); // Atualiza o campo location
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Inventory2 sx={{ mr: 1 }} />
          Cadastrar Inventário
        </Typography>

        {/* Formulário utilizando react-hook-form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Produto</InputLabel>
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} required>
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
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantidade"
                    fullWidth
                    variant="outlined"
                    type="number"
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
                )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="discount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Desconto"
                    fullWidth
                    variant="outlined"
                    type="number"
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
                )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Localização"
                    fullWidth
                    required
                    variant="outlined"
                    rules={{ required: 'O código de Localização é obrigatório' }}
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
                )}
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
