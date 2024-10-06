import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Grid,
} from '@mui/material';
import { AddCircleOutline, PersonOutline, EmailOutlined, PhoneOutlined, DescriptionOutlined, LocationOnOutlined } from '@mui/icons-material';
import api from './../../../../api';

const CustomerForm = ({ onCustomerAdded }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('CREDIT_CARD');
  const [communicationPreference, setCommunicationPreference] = useState('EMAIL');
  const [isDefaultCustomer, setIsDefaultCustomer] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const customerData = {
      fullname: isDefaultCustomer ? null : fullname,
      email: isDefaultCustomer ? null : email,
      phone: isDefaultCustomer ? null : phone,
      cpf: isDefaultCustomer ? null : cpf,
      cep: isDefaultCustomer ? null : cep,
      notes,
      preferredPaymentMethod,
      communicationPreference,
      isDefaultCustomer,
    };

    try {
      const response = await api.post('/customer', customerData);
      if (response.status === 201) {
        onCustomerAdded(response.data);

        // Limpar campos após o envio
        setFullname('');
        setEmail('');
        setPhone('');
        setCpf('');
        setCep('');
        setNotes('');
        setPreferredPaymentMethod('CREDIT_CARD');
        setCommunicationPreference('EMAIL');
        setIsDefaultCustomer(false);
      }
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <PersonOutline sx={{ mr: 1 }} />
          Cadastrar Cliente
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {!isDefaultCustomer && (
            <>
              <TextField
                label="Nome Completo"
                fullWidth
                variant="outlined"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
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
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Telefone"
                fullWidth
                variant="outlined"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="CPF"
                fullWidth
                variant="outlined"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="CEP"
                fullWidth
                variant="outlined"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                required
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          <TextField
            label="Notas"
            fullWidth
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionOutlined />
                </InputAdornment>
              ),
            }}
          />

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pagamento Preferido</Typography>
                <RadioGroup
                  value={preferredPaymentMethod}
                  onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="CREDIT_CARD" control={<Radio />} label="Cartão de Crédito" />
                  <FormControlLabel value="DEBIT_CARD" control={<Radio />} label="Cartão de Débito" />
                  <FormControlLabel value="MONEY" control={<Radio />} label="Dinheiro" />
                  <FormControlLabel value="ANY" control={<Radio />} label="Qualquer um" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Preferência de Comunicação</Typography>
                <RadioGroup
                  value={communicationPreference}
                  onChange={(e) => setCommunicationPreference(e.target.value)}
                >
                  <FormControlLabel value="EMAIL" control={<Radio />} label="E-mail" />
                  <FormControlLabel value="SMS" control={<Radio />} label="SMS" />
                  <FormControlLabel value="PHONE" control={<Radio />} label="Telefone" />
                  <FormControlLabel value="ANY" control={<Radio />} label="Qualquer um" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={isDefaultCustomer}
                onChange={(e) => setIsDefaultCustomer(e.target.checked)}
              />
            }
            label="Cliente Padrão"
            sx={{ mb: 4 }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Cliente
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerForm;
