import React, { useState } from 'react';
import SupplierForm from './SupplierForm'; // Componente do formulário de fornecedores
import Suppliers from './SupplierList'; // Componente da lista de fornecedores
import { Box, Typography } from '@mui/material';

const SupplierManagement = () => {
    const [rows, setRows] = useState([]);

    const handleAddSupplier = (newSupplier) => {
        setRows((prevRows) => [...prevRows, newSupplier]);
    };

    return (
        <Box sx={{ mt: 10 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Gerenciamento de Fornecedores
            </Typography>
            <SupplierForm onAddSupplier={handleAddSupplier} />
            <Box sx={{ mt: 3 }}>
                <Suppliers rows={rows} />
            </Box>
        </Box>
    );
};

export default SupplierManagement;
