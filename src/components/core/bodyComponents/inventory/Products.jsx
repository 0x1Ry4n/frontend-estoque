import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import productList from "./productList"; 

const Products = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rows, setRows] = useState(productList);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleClickOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (ids) => {
    setRows(rows.filter((row) => !ids.includes(row.id)));
    setSnackbarMessage("Produto(s) deletado(s) com sucesso!");
    setSnackbarOpen(true);
  };

  const handleSave = () => {
    if (!selectedProduct.name || !selectedProduct.category || !selectedProduct.price || !selectedProduct.stock) {
      setSnackbarMessage("Por favor, preencha todos os campos!");
      setSnackbarOpen(true);
      return;
    }

    if (selectedProduct.id) {
      setRows(rows.map((row) => (row.id === selectedProduct.id ? selectedProduct : row)));
      setSnackbarMessage("Produto atualizado com sucesso!");
    } else {
      const newProduct = { id: rows.length + 1, ...selectedProduct };
      setRows([...rows, newProduct]);
      setSnackbarMessage("Produto adicionado com sucesso!");
    }
    
    handleClose();
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "product",
      headerName: "Produto",
      width: 300,
      editable: true,
      renderCell: (cellData) => (
        <TextField
          value={cellData.row.name}
          onChange={(e) => {
            const updatedRow = { ...cellData.row, name: e.target.value };
            setRows(rows.map(row => (row.id === updatedRow.id ? updatedRow : row)));
          }}
        />
      ),
    },
    {
      field: "category",
      headerName: "Categoria",
      width: 200,
      editable: true,
    },
    {
      field: "price",
      headerName: "Preço",
      width: 150,
      editable: true,
    },
    {
      field: "stock",
      headerName: "Estoque",
      width: 150,
      editable: true,
    },
    {
      field: "actions",
      headerName: "Ações",
      renderCell: (cellData) => (
        <Button onClick={() => handleDelete([cellData.row.id])}>
          <DeleteIcon />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => handleClickOpen({})}>
        <AddIcon /> Adicionar Produto
      </Button>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
      />
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedProduct ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Produto"
            fullWidth
            value={selectedProduct?.name || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
          />
          <TextField
            label="Categoria"
            fullWidth
            value={selectedProduct?.category || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
          />
          <TextField
            label="Preço"
            fullWidth
            type="number"
            value={selectedProduct?.price || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
          />
          <TextField
            label="Estoque"
            fullWidth
            type="number"
            value={selectedProduct?.stock || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Products;
