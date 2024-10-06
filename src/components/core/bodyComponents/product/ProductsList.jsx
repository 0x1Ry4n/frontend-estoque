import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api'; 

const Products = () => {
  const [open, setOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);
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

  const handleDetailOpen = async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      setDetailedProduct(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      setSnackbarMessage("Erro ao carregar detalhes do produto.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
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
      const productToSave = {
        ...selectedProduct,
        price: selectedProduct.unitPrice, 
      };

      if (isEditing) {
        await api.patch(`/products/${selectedProduct.id}`, productToSave); 
        setRows(rows.map((row) => (row.id === selectedProduct.id ? productToSave : row)));
        setSnackbarMessage("Produto atualizado com sucesso!");
      } else {
        const newProduct = { id: rows.length + 1, ...productToSave };
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
      field: "description",
      headerName: "Descrição",
      width: 300,
      editable: true,
    },
    {
      field: "unitPrice",
      headerName: "Preço",
      width: 150,
      editable: true,
    },
    {
      field: "originalStockQuantity", 
      headerName: "Quantidade em Estoque (Original)",
      width: 150,
      editable: false,
    },
    {
      field: "originalStockPrice",
      headerName: "Valor Original em Estoque",
      width: 150,
      valueGetter: (params) => {
        const originalStockPrice = params.row.unitPrice * params.row.originalStockQuantity;
        return originalStockPrice.toFixed(2);
      },
    },
    {
      field: "stockQuantity", 
      headerName: "Quantidade em Estoque",
      width: 150,
      editable: false,
    },
    {
      field: "totalPrice",
      headerName: "Valor Total",
      width: 150,
      valueGetter: (params) => {
        const totalPrice = params.row.unitPrice * params.row.stockQuantity;
        return totalPrice.toFixed(2);
      },
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
      width: 200,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
          <Button onClick={() => handleDelete([cellData.row.id])}>
            <DeleteIcon />
          </Button>
          <Button onClick={() => handleDetailOpen(cellData.row.id)} color="primary">
            <VisibilityIcon />
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
            InputProps={{ readOnly: isEditing }} 
          />
          <TextField
            label="Categoria"
            fullWidth
            margin="normal"
            value={selectedProduct?.categoryId || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, categoryId: e.target.value })}
            InputProps={{ readOnly: isEditing }} 
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            value={selectedProduct?.description || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
            InputProps={{ readOnly: isEditing }} 
          />
          <TextField
            label="Preço"
            fullWidth
            type="number"
            margin="normal"
            value={selectedProduct?.unitPrice || ""}
            onChange={(e) => setSelectedProduct({ ...selectedProduct, unitPrice: parseFloat(e.target.value) })}
            InputProps={{ readOnly: isEditing }} 
          />
          <TextField
            label="Quantidade em Estoque (Original)" 
            fullWidth
            margin="normal"
            value={selectedProduct?.originalStockQuantity || ""} 
            InputProps={{ readOnly: true }} 
          />
          <TextField
            label="Quantidade em Estoque" 
            fullWidth
            margin="normal"
            value={selectedProduct?.stockQuantity || ""}
            InputProps={{ readOnly: true }} 
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
            InputProps={{ readOnly: isEditing }} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {isEditing && <Button onClick={handleSave}>Confirmar</Button>} 
        </DialogActions>
      </Dialog>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)}>
        <DialogTitle>Detalhes do Produto</DialogTitle>
        <DialogContent>
          {detailedProduct && (
            <div>
              <p><strong>ID:</strong> {detailedProduct.id}</p>
              <p><strong>Nome:</strong> {detailedProduct.name}</p>
              <p><strong>Descrição:</strong> {detailedProduct.description}</p>
              <p><strong>Preço:</strong> {detailedProduct.unitPrice.toFixed(2)} BRL</p>
              <p><strong>Quantidade em Estoque (Original):</strong> {detailedProduct.originalStockQuantity}</p>
              <p><strong>Quantidade em Estoque:</strong> {detailedProduct.stockQuantity}</p>
              <p><strong>Valor Total:</strong> {(detailedProduct.unitPrice * detailedProduct.stockQuantity).toFixed(2)} BRL</p>
              <p><strong>Valor Original em Estoque:</strong> {(detailedProduct.unitPrice * detailedProduct.originalStockQuantity).toFixed(2)} BRL</p>
              <p><strong>Data de Expiração:</strong> {detailedProduct.expirationDate}</p>
              <p><strong>Categoria:</strong> {detailedProduct.category?.name}</p>
              <hr />
              <h3>Inventário</h3>
              {detailedProduct.inventory.map((item) => (
                <div key={item.id}>
                  <p><strong>ID do Item:</strong> {item.id}</p>
                  <p><strong>Localização:</strong> {item.location}</p>
                  <p><strong>Quantidade Original:</strong> {item.originalQuantity}</p>
                  <p><strong>Quantidade:</strong> {item.quantity}</p>
                  <p><strong>Preço Unitário:</strong> {item.unitPrice.toFixed(2)} BRL</p>
                  <p><strong>Desconto:</strong> {item.discount} BRL</p>
                  <hr />
                </div>
              ))}

              <h3>Fornecedores</h3>
              {detailedProduct.suppliers.map((supplier) => (
                <div key={supplier.id}>
                  <p><strong>ID do Fornecedor:</strong> {supplier.id}</p>
                  <p><strong>Nome:</strong> {supplier.name}</p>
                  <p><strong>Email:</strong> {supplier.email}</p>
                  <p><strong>Telefone:</strong> {supplier.phone}</p>
                  <p><strong>Data de Criação:</strong> {new Date(supplier.createdAt).toLocaleString()}</p>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Fechar</Button>
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
