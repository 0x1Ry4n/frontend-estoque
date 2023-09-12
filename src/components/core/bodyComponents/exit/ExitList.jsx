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

const ExitList = () => {
  const [open, setOpen] = useState(false);
  const [selectedExit, setSelectedExit] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);

  const exitStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
    RETURNED: "Retornado",
  };

  useEffect(() => {
    fetchExits();
  }, []);

  const fetchExits = async () => {
    try {
      const response = await api.get("/exits");
      setRows(response.data.content);
    } catch (error) {
      console.error("Erro ao buscar as saídas: ", error);
      setSnackbarMessage("Erro ao carregar as saídas.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (exit) => {
    setSelectedExit(exit);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedExit(null);
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
        await api.delete(`/exits/${ids[0]}`);
        setSnackbarMessage("Saída deletada com sucesso!");
        setSnackbarSeverity("success");
        fetchExits();
      } catch (error) {
        setSnackbarMessage("Erro ao deletar a Saída.");
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedExit.name) {
      setSnackbarMessage("Por favor, preencha o nome da saída!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/exits/${selectedExit.id}`, {
          name: selectedExit.name,
        });
        setSnackbarMessage("Saída atualizada com sucesso!");
      } else {
        const newExit = { name: selectedExit.name };
        await api.post("/exits", newExit);
        setSnackbarMessage("Saída adicionada com sucesso!");
      }
      setSnackbarSeverity("success");
      fetchExits();
    } catch (error) {
      setSnackbarMessage("Erro ao salvar a Saída.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchExits();
    setSnackbarMessage("Lista de Saídas atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productId", headerName: "ID Produto", width: 100 },
    { field: "quantity", headerName: "Quantidade", type: "number", width: 150 },
    { field: "inventoryCode", headerName: "Código (Inventário)", width: 150 },
    {
      field: "status",
      headerName: "Status de Saída",
      width: 150,
      valueGetter: (params) =>
        exitStatusMap[params.row.status] || "Desconhecido",
    },
    {
      field: "exitDate",
      headerName: "Data de Saída",
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
            value={selectedExit?.name || ""}
            onChange={(e) =>
              setSelectedExit({
                ...selectedExit,
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

export default ExitList;
