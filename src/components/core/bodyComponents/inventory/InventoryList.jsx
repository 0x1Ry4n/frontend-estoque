import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api';

const Inventory = () => {
  const [open, setOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);
  const [products, setProducts] = useState([]); // State to hold product data

  useEffect(() => {
    fetchInventory(); // Fetch inventory data when component mounts
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/products/inventory');
      setRows(response.data.content);
      await fetchProducts(); // Fetch products after getting inventory
    } catch (error) {
      console.error("Erro ao buscar inventário: ", error);
      setSnackbarMessage("Erro ao carregar inventário.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products'); // Assuming there's an endpoint for products
      setProducts(response.data.content);
    } catch (error) {
      console.error("Erro ao buscar produtos: ", error);
      setSnackbarMessage("Erro ao carregar produtos.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (inventory) => {
    setSelectedInventory(inventory);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInventory(null);
    setIsEditing(false);
  };

  const handleDelete = async (inventory) => {
    try {
      await api.delete(`/products/${inventory[0].productId}/inventory/${inventory[0].id}`);
      setRows(rows.filter((row) => row.id !== inventory[0].id)); // Fix for filtering rows
      setSnackbarMessage("Item de inventário deletado com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao deletar item de inventário.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSave = async () => {
    const { productId, quantity, discount, location } = selectedInventory;

    if (!productId || quantity < 0) {
      setSnackbarMessage("Por favor, preencha todos os campos corretamente!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/inventory/${selectedInventory.id}`, { productId, quantity, discount, location });
        setRows(rows.map((row) => (row.id === selectedInventory.id ? selectedInventory : row)));
        setSnackbarMessage("Item de inventário atualizado com sucesso!");
      } else {
        const newInventory = { productId, quantity, discount, location };
        const response = await api.post('/inventory', newInventory);
        setRows([...rows, response.data.content]);
        setSnackbarMessage("Item de inventário adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao salvar item de inventário.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchInventory(); // Refresh inventory list on button click
    setSnackbarMessage("Lista de inventário atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productId", headerName: "Produto ID", width: 150 },
    {
      field: "productName",
      headerName: "Nome do Produto",
      width: 200,
      valueGetter: (params) => {
        const product = products.find((p) => p.id === params.row.productId);
        return product ? product.name : 'Desconhecido';
      }
    },
    {
      field: "unitPrice",
      headerName: "Preço Unitário",
      width: 150,
      valueGetter: (params) => {
        const product = products.find((p) => p.id === params.row.productId);
        return product ? product.unitPrice.toFixed(2) : '0.00';
      }
    },
    { field: "quantity", headerName: "Quantidade", width: 150, type: 'number' },
    { field: "discount", headerName: "Desconto", width: 150, type: 'number' },
    {
      field: "totalValue",
      headerName: "Valor Total (Lote)",
      width: 150,
      valueGetter: (params) => {
        const product = products.find((p) => p.id === params.row.productId);
        const unitPrice = product ? product.unitPrice : 0; 
        return (unitPrice * params.row.quantity).toFixed(2);
      }
    },
    { field: "location", headerName: "Localização", width: 150 },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
          <Button onClick={() => handleDelete([cellData.row])}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Button 
        variant="outlined" 
        startIcon={<RefreshIcon />} 
        onClick={handleRefresh} // Button to refresh the inventory list
        sx={{ mb: 2 }}
      >
        Atualizar Lista
      </Button>
      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Item de Inventário" : "Adicionar Item de Inventário"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Produto ID"
            fullWidth
            margin="normal"
            value={selectedInventory?.productId || ""}
            onChange={(e) => setSelectedInventory({ ...selectedInventory, productId: e.target.value })}
            InputProps={{ readOnly: true }} 
          />
          <TextField
            label="Quantidade"
            type="number"
            fullWidth
            margin="normal"
            value={selectedInventory?.quantity || ""}
            onChange={(e) => setSelectedInventory({ ...selectedInventory, quantity: Number(e.target.value) })}
          />
          <TextField
            label="Desconto"
            type="number"
            fullWidth
            margin="normal"
            value={selectedInventory?.discount || ""}
            onChange={(e) => setSelectedInventory({ ...selectedInventory, discount: Number(e.target.value) })}
          />
          <TextField
            label="Localização"
            fullWidth
            margin="normal"
            value={selectedInventory?.location || ""}
            onChange={(e) => setSelectedInventory({ ...selectedInventory, location: e.target.value })}
            InputProps={{ readOnly: true }} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Confirmar</Button>
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

export default Inventory;