import React, { useState } from 'react'; 
import CategoryForm from './CategoryForm'; // Componente do formulário de categorias
import Categories from './CategoryList'; // Componente da lista de categorias
import { Box, Typography } from '@mui/material'; 

const CategoryManagement = () => {
    const [rows, setRows] = useState([]); 

  const handleAddCategory = (newCategory) => {
    setRows((prevRows) => [...prevRows, newCategory]); 
  };

  return (
    <Box sx={{ }}>
      <Typography variant="h4" sx={{ mb: 4, mt: 10, fontWeight: 'bold' }}>
        Gerenciamento de Categorias
      </Typography>
      <CategoryForm onAddCategory={handleAddCategory}  /> 
      <Box sx={{ mt: 3 }}> 
        <Categories 
            rows={rows}
        /> 
      </Box>
    </Box>
  );
};

export default CategoryManagement; 
