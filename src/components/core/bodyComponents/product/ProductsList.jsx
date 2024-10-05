import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import { Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api'; 

const Products = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setRows(response.data.content);
      } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
        setSnackbarMessage("Erro ao carregar produtos.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchProducts();
  }, []);

  const handleClickOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
    setIsEditing(true); 
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setIsEditing(false); 
  };

  const handleDelete = async (ids) => {
    try {
      await api.delete(`/products/${ids[0]}`);
      setRows(rows.filter((row) => !ids.includes(row.id)));
      setSnackbarMessage("Produto deletado com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao deletar produto.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSave = async () => {
    if (!selectedProduct.name || !selectedProduct.categoryId || !selectedProduct.unitPrice || !selectedProduct.expirationDate) {
      setSnackbarMessage("Por favor, preencha todos os campos!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/products/${selectedProduct.id}`, selectedProduct); 
        setRows(rows.map((row) => (row.id === selectedProduct.id ? selectedProduct : row)));
        setSnackbarMessage("Produto atualizado com sucesso!");
      } else {
        const newProduct = { id: rows.length + 1, ...selectedProduct };
        await api.post('/products', newProduct);
        setRows([...rows, newProduct]);
        setSnackbarMessage("Produto adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao salvar produto.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Produto",
      width: 300,
      editable: true,
    },
    {
      field: "categoryId",
      headerName: "Categoria",
      width: 200,
      editable: true,
    },
    {
      field: "unitPrice",
      headerName: "Preço",
      width: 150,
      editable: true,
    },
    {
      field: "description",
      headerName: "Descrição",
      width: 300,
      editable: true,
    },
    {
      field: "expirationDate",
      headerName: "Data de Expiração",
      width: 150,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      editable: true,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            Editar
          </Button>
          <Button onClick={() => handleDelete([cellData.row.id])}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
        />
      </div>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Produto"
            fullWidth
            margin="normal"
            value={selectedProduct?.name || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
            InputProps={{ readOnly: isEditing }} // Torna o campo somente leitura se estiver editando
          />
          <TextField
            label="Categoria"
            fullWidth
            margin="normal"
            value={selectedProduct?.categoryId || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, categoryId: e.target.value })}
            InputProps={{ readOnly: isEditing }} // Torna o campo somente leitura se estiver editando
          />
          <TextField
            label="Preço"
            fullWidth
            type="number"
            margin="normal"
            value={selectedProduct?.unitPrice || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, unitPrice: parseFloat(e.target.value) })}
            InputProps={{ readOnly: isEditing }} // Torna o campo somente leitura se estiver editando
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            value={selectedProduct?.description || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
            InputProps={{ readOnly: isEditing }} // Torna o campo somente leitura se estiver editando
          />
          <TextField
            label="Data de Expiração"
            fullWidth
            type="date"
            margin="normal"
            value={selectedProduct?.expirationDate || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, expirationDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{ readOnly: isEditing }} // Torna o campo somente leitura se estiver editando
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {isEditing && <Button onClick={handleSave}>Confirmar</Button>} {/* Somente mostra o botão "Confirmar" durante a edição */}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Products;
