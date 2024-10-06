import React, { useState } from 'react'; 
import InventoryForm from './InventoryForm'; // Componente do formulário de inventário
import InventoryList from './InventoryList'; // Componente da lista de inventário
import InventoryOverview from './Overview'; // Componente do resumo do inventário
import { Box, Typography } from '@mui/material'; 

const InventoryManagement = () => {
    const [rows, setRows] = useState([]); 

    const handleAddInventoryItem = (newItem) => {
        setRows((prevRows) => [...prevRows, newItem]); 
    };

    // Exemplo de dados para o resumo do inventário
    const totalProducts = 15226;
    const todaySales = 5241;
    const yesterdaySales = 3652;
    const totalSales = 11425;
    const reservedProducts = 6547;
    const stockIssues = 9562;

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
            <Box sx={{ flex: 1, mt: 0 }}> {/* Ajuste no mt para o Box da visão geral */}
                <InventoryOverview 
                    totalProducts={totalProducts} 
                    todaySales={todaySales} 
                    yesterdaySales={yesterdaySales} 
                    totalSales={totalSales} 
                    reservedProducts={reservedProducts} 
                    stockIssues={stockIssues} 
                />
            </Box>
        </Box>
    );
};

export default InventoryManagement;
