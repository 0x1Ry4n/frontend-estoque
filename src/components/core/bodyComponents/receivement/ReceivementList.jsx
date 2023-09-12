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
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../../../api";
import Swal from "sweetalert2";

const ReceivementList = () => {
  const [open, setOpen] = useState(false);
  const [selectedReceivement, setSelectedReceivement] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);

  const receivementStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
    RETURNED: "Retornado",
  };

  useEffect(() => {
    fetchReceivements();
  }, []);

  const fetchReceivements = async () => {
    try {
      const response = await api.get("/receivements");
      setRows(response.data.content);
    } catch (error) {
      console.error("Erro ao buscar os recebimentos: ", error);
      setSnackbarMessage("Erro ao carregar os recebimentos.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (category) => {
    setSelectedReceivement(category);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReceivement(null);
    setIsEditing(false);
  };

  const handleDelete = async (ids) => {
    const confirmDelete = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });
    if (confirmDelete.isConfirmed) {
      try {
        await api.delete(`/receivements/${ids[0]}`);
        setSnackbarMessage("Recebimento deletado com sucesso!");
        setSnackbarSeverity("success");
        fetchReceivements();
      } catch (error) {
        setSnackbarMessage("Erro ao deletar o recebimento.");
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedReceivement.name) {
      setSnackbarMessage("Por favor, preencha o nome do recebimento!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/receivements/${selectedReceivement.id}`, {
          name: selectedReceivement.name,
        });
        setSnackbarMessage("Recebimento atualizado com sucesso!");
      } else {
        const newCategory = { name: selectedReceivement.name };
        await api.post("/receivements", newCategory);
        setSnackbarMessage("Recebimento adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
      fetchReceivements();
    } catch (error) {
      setSnackbarMessage("Erro ao salvar o recebimento.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchReceivements();
    setSnackbarMessage("Lista de recebimentos atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productId", headerName: "ID Produto", width: 100 },
    { field: "supplierName", headerName: "Fornecedor", width: 200 },
    { field: "inventoryCode", headerName: "Código (Inventário)", width: 150 },
    { field: "quantity", headerName: "Quantidade", type: "number", width: 150 },
    {
      field: "totalPrice",
      headerName: "Valor Total",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status de Entrada",
      width: 150,
      valueGetter: (params) =>
        receivementStatusMap[params.row.status] || "Desconhecido",
    },
    {
      field: "receivingDate",
      headerName: "Data de Entrada",
      width: 150,
      type: "date",
      valueGetter: (params) => new Date(params.value),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
          <Button onClick={() => handleDelete([cellData.row.id])}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        sx={{ mb: 2 }}
      >
        Atualizar Lista
      </Button>
      <div
        style={{
          height: 400,
          width: "100%",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <DataGrid rows={rows} columns={columns} />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Editar Categoria" : "Adicionar Categoria"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Categoria"
            fullWidth
            margin="normal"
            value={selectedReceivement?.name || ""}
            onChange={(e) =>
              setSelectedReceivement({
                ...selectedReceivement,
                name: e.target.value,
              })
            }
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>
            {isEditing ? "Confirmar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReceivementList;
