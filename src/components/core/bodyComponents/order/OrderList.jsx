import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api'; 

const Orders = () => {
  const [open, setOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setRows(response.data.content);
      } catch (error) {
        console.error("Erro ao buscar pedidos: ", error);
        setSnackbarMessage("Erro ao carregar pedidos.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchOrders();
  }, []);

  const handleClickOpen = (order) => {
    setSelectedOrder(order);
    setOpen(true);
    setIsEditing(true); 
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
    setIsEditing(false); 
  };

  const handleDetailOpen = async (id) => {
    try {
      const response = await api.get(`/orders/${id}/details`);
      setDetailedOrder(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      setSnackbarMessage("Erro ao carregar detalhes do pedido.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (ids) => {
    try {
      await api.delete(`/orders/${ids[0]}`);
      setRows(rows.filter((row) => !ids.includes(row.id)));
      setSnackbarMessage("Pedido deletado com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao deletar pedido.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSave = async () => {
    if (!selectedOrder.customerName || !selectedOrder.totalAmount || !selectedOrder.orderDate) {
      setSnackbarMessage("Por favor, preencha todos os campos!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const orderToSave = {
        ...selectedOrder,
      };

      if (isEditing) {
        await api.patch(`/orders/${selectedOrder.id}`, orderToSave); 
        setRows(rows.map((row) => (row.id === selectedOrder.id ? orderToSave : row)));
        setSnackbarMessage("Pedido atualizado com sucesso!");
      } else {
        const newOrder = { id: rows.length + 1, ...orderToSave };
        await api.post('/orders', newOrder);
        setRows([...rows, newOrder]);
        setSnackbarMessage("Pedido adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao salvar pedido.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "customerName",
      headerName: "Cliente",
      width: 300,
      editable: true,
    },
    {
      field: "totalAmount",
      headerName: "Valor Total",
      width: 150,
      editable: true,
    },
    {
      field: "orderDate",
      headerName: "Data do Pedido",
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
        <DialogTitle>{isEditing ? "Editar Pedido" : "Adicionar Pedido"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Cliente"
            fullWidth
            margin="normal"
            value={selectedOrder?.customerName || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, customerName: e.target.value })}
            InputProps={{ readOnly: isEditing }} 
          />
          <TextField
            label="Valor Total"
            fullWidth
            type="number"
            margin="normal"
            value={selectedOrder?.totalAmount || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, totalAmount: parseFloat(e.target.value) })}
            InputProps={{ readOnly: isEditing }} 
          />
          <TextField
            label="Data do Pedido"
            fullWidth
            type="date"
            margin="normal"
            value={selectedOrder?.orderDate || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, orderDate: e.target.value })}
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
        <DialogTitle>Detalhes do Pedido</DialogTitle>
        <DialogContent>
          {detailedOrder && (
            <div>
              <p><strong>ID:</strong> {detailedOrder.id}</p>
              <p><strong>Nome do Cliente:</strong> {detailedOrder.customerName}</p>
              <p><strong>Valor Total:</strong> {detailedOrder.totalAmount.toFixed(2)} BRL</p>
              <p><strong>Data do Pedido:</strong> {new Date(detailedOrder.orderDate).toLocaleDateString()}</p>
              {/* Adicione aqui mais informações detalhadas sobre o pedido, se necessário */}
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

export default Orders;
