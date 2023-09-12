import React, { useState } from 'react'; 
import InventoryForm from './InventoryForm'; // Componente do formulário de inventário
import InventoryList from './InventoryList'; // Componente da lista de inventário
import { Box, Typography } from '@mui/material'; 

const InventoryManagement = () => {
    const [rows, setRows] = useState([]); 

    const handleAddInventoryItem = (newItem) => {
        setRows((prevRows) => [...prevRows, newItem]); 
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 10, p: 4 }}> {/* Ajuste no mt */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Gerenciamento de Inventário
                </Typography>
                <InventoryForm onInventoryAdded={handleAddInventoryItem} /> {/* Corrigido para onInventoryAdded */}
                <Box sx={{ mt: 3 }}> 
                    <InventoryList 
                        rows={rows}
                    /> 
                </Box>
            </Box>
        </Box>
    );
};

export default InventoryManagement;
