import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert, CircularProgress } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
  const [loading, setLoading] = useState(false);  

  useEffect(() => {
    fetchOrders(); // Carregar pedidos ao montar o componente
  }, []);

  const fetchOrders = async () => {
    setLoading(true); 
    try {
      const response = await api.get('/orders/details');

      const ordersWithId = response.data.content.map(order => ({
        id: order.orderId, 
        ...order 
      }));
      setRows(ordersWithId); 
    } catch (error) {
      setSnackbarMessage("Erro ao carregar pedidos.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false); 
    }
  };

  const handleClickOpen = (order) => {
    setSelectedOrder(order || { fullName: "", totalPrice: 0, orderDate: "", paymentMethod: "", orderStatus: "", customer: { cpf: "", email: "", phone: "" } });
    setOpen(true);
    setIsEditing(!!order);
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
    const { fullName, totalPrice, orderDate, paymentMethod, orderStatus } = selectedOrder;
    
    // Validação antes de salvar
    if (!fullName || !totalPrice || !orderDate || !paymentMethod || !orderStatus) {
      setSnackbarMessage("Por favor, preencha todos os campos obrigatórios.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const orderToSave = { ...selectedOrder };

      if (isEditing) {
        await api.patch(`/orders/${selectedOrder.id}`, orderToSave);
        setRows(rows.map((row) => (row.id === selectedOrder.id ? orderToSave : row)));
        setSnackbarMessage("Pedido atualizado com sucesso!");
      } else {
        const response = await api.post('/orders', orderToSave);
        setRows([...rows, response.data]);  
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

  const handleRefresh = () => {
    fetchOrders(); 
    setSnackbarMessage("Lista de pedidos atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "fullName",
      headerName: "Cliente",
      width: 200,
      valueGetter: (params) => params.row.customer?.fullname || "",
    },
    {
      field: "phone",
      headerName: "Telefone",
      width: 150,
      valueGetter: (params) => params.row.customer?.phone || "",
    },
    {
      field: "cpf",
      headerName: "CPF",
      width: 150,
      valueGetter: (params) => params.row.customer?.cpf || "",
    },
    {
      field: "orderDate",
      headerName: "Data do Pedido",
      width: 150,
      type: 'date',
      valueGetter: (params) => new Date(params.row.orderDate),
    },
    {
      field: "productName",
      headerName: "Nome do Produto",
      width: 150,
      valueGetter: (params) => (params.row.inventory.productName || ""),
    },
    {
      field: "totalPrice",
      headerName: "Valor Total",
      width: 150,
      valueGetter: (params) => (params.row.totalPrice ? params.row.totalPrice.toFixed(2) : ""),
    },
    {
      field: "paymentMethod",
      headerName: "Método de Pagamento",
      width: 180,
      valueGetter: (params) => params.row.paymentMethod || "",
    },
    {
      field: "orderStatus",
      headerName: "Status",
      width: 150,
      valueGetter: (params) => params.row.orderStatus || "",
    },
    {
      field: "inventoryLocation",
      headerName: "Localização do Estoque",
      width: 180,
      valueGetter: (params) => params.row.inventory?.location || "",
    },
    {
      field: "inventoryQuantity",
      headerName: "Quantidade no Estoque",
      width: 180,
      valueGetter: (params) => params.row.inventory?.quantity || "",
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
      <Button 
        variant="outlined" 
        startIcon={<RefreshIcon />} 
        onClick={handleRefresh} // Botão para atualizar a lista de pedidos
        sx={{ mb: 2 }}
      >
        Atualizar Lista
      </Button>
      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        {loading ? (  // Mostra o carregamento enquanto os dados estão sendo buscados
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </div>
        ) : (
          <DataGrid rows={rows} columns={columns} />
        )}
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Pedido" : "Adicionar Pedido"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Cliente"
            fullWidth
            margin="normal"
            value={selectedOrder?.fullName || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, fullName: e.target.value })}
          />
          <TextField
            label="Valor Total"
            fullWidth
            type="number"
            margin="normal"
            value={selectedOrder?.totalPrice || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, totalPrice: parseFloat(e.target.value) })}
          />
          <TextField
            label="Data do Pedido"
            fullWidth
            type="date"
            margin="normal"
            value={selectedOrder?.orderDate || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, orderDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Método de Pagamento"
            fullWidth
            margin="normal"
            value={selectedOrder?.paymentMethod || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, paymentMethod: e.target.value })}
          />
          <TextField
            label="Status"
            fullWidth
            margin="normal"
            value={selectedOrder?.orderStatus || ""}
            onChange={(e) => setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} color="primary">{isEditing ? "Salvar" : "Adicionar"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)}>
  <DialogTitle>Detalhes do Pedido</DialogTitle>
  <DialogContent>
    {detailedOrder && (
      <div>
        {/* Informações do Pedido */}
        <p><strong>ID do Pedido:</strong> {detailedOrder.orderId}</p>
        <p><strong>Quantidade:</strong> {detailedOrder.quantity}</p>
        <p><strong>Método de Pagamento:</strong> {detailedOrder.paymentMethod}</p>
        <p><strong>Status do Pedido:</strong> {detailedOrder.orderStatus}</p>
        <p><strong>Valor Total:</strong> {detailedOrder.totalPrice.toFixed(2)} BRL</p>
        <p><strong>Data do Pedido:</strong> {new Date(detailedOrder.orderDate).toLocaleDateString()}</p>

        <hr />

        {/* Informações do Cliente */}
        <h3>Informações do Cliente</h3>
        <p><strong>ID do Cliente:</strong> {detailedOrder.customer.id}</p>
        <p><strong>Nome Completo:</strong> {detailedOrder.customer.fullname}</p>
        <p><strong>Email:</strong> {detailedOrder.customer.email}</p>
        <p><strong>Telefone:</strong> {detailedOrder.customer.phone}</p>
        <p><strong>CPF:</strong> {detailedOrder.customer.cpf}</p>
        <p><strong>CEP:</strong> {detailedOrder.customer.cep}</p>
        <p><strong>Notas:</strong> {detailedOrder.customer.notes}</p>
        <p><strong>Método de Pagamento Preferido:</strong> {detailedOrder.customer.preferredPaymentMethod}</p>
        <p><strong>Preferência de Comunicação:</strong> {detailedOrder.customer.communicationPreference}</p>
        <p><strong>Cliente Padrão:</strong> {detailedOrder.customer.isDefaultCustomer ? "Sim" : "Não"}</p>
        <p><strong>Status do Cliente:</strong> {detailedOrder.customer.customerStatus}</p>
        <p><strong>Data de Criação do Cliente:</strong> {new Date(detailedOrder.customer.createdAt).toLocaleDateString()}</p>

        <hr />

        {/* Informações do Inventário */}
        <h3>Informações do Inventário</h3>
        <p><strong>ID do Inventário:</strong> {detailedOrder.inventory.id}</p>
        <p><strong>ID do Produto:</strong> {detailedOrder.inventory.productId}</p>
        <p><strong>Quantidade Original:</strong> {detailedOrder.inventory.originalQuantity}</p>
        <p><strong>Quantidade Atual:</strong> {detailedOrder.inventory.quantity}</p>
        <p><strong>Preço Unitário:</strong> {detailedOrder.inventory.unitPrice.toFixed(2)} BRL</p>
        <p><strong>Localização:</strong> {detailedOrder.inventory.location}</p>
        <p><strong>Desconto:</strong> {detailedOrder.inventory.discount.toFixed(2)} BRL</p>
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
