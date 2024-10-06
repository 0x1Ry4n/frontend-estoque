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
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api'; 

const Suppliers = () => {
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get('/supplier'); // Alterado para o endpoint de fornecedores
        setRows(response.data.content);
      } catch (error) {
        console.error("Erro ao buscar fornecedores: ", error);
        setSnackbarMessage("Erro ao carregar fornecedores.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchSuppliers();
  }, []);

  const handleClickOpen = (supplier) => {
    setSelectedSupplier(supplier);
    setOpen(true);
    setIsEditing(true); 
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSupplier(null);
    setIsEditing(false); 
  };

  const handleDelete = async (ids) => {
    try {
      await api.delete(`/supplier/${ids[0]}`); // Alterado para o endpoint de fornecedores
      setRows(rows.filter((row) => !ids.includes(row.id)));
      setSnackbarMessage("Fornecedor deletado com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao deletar fornecedor.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSave = async () => {
    if (!selectedSupplier.name) {
      setSnackbarMessage("Por favor, preencha o nome do fornecedor!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/supplier/${selectedSupplier.id}`, { name: selectedSupplier.name, email: selectedSupplier.email, phone: selectedSupplier.phone });
        setRows(rows.map((row) => (row.id === selectedSupplier.id ? selectedSupplier : row)));
        setSnackbarMessage("Fornecedor atualizado com sucesso!");
      } else {
        const newSupplier = { name: selectedSupplier.name, email: selectedSupplier.email, phone: selectedSupplier.phone };
        const response = await api.post('/supplier', newSupplier);
        setRows([...rows, response.data.content]);
        setSnackbarMessage("Fornecedor adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao salvar fornecedor.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Nome", width: 200, editable: true },
    { field: "email", headerName: "E-mail", width: 200, editable: true },
    { field: "phone", headerName: "Telefone", width: 150, editable: true },
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
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
        />
      </div>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Fornecedor" : "Adicionar Fornecedor"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={selectedSupplier?.name || ""}
            onChange={(e) => setSelectedSupplier({ ...selectedSupplier, name: e.target.value })}
          />
          <TextField
            label="E-mail"
            fullWidth
            margin="normal"
            value={selectedSupplier?.email || ""}
            onChange={(e) => setSelectedSupplier({ ...selectedSupplier, email: e.target.value })}
          />
          <TextField
            label="Telefone"
            fullWidth
            margin="normal"
            value={selectedSupplier?.phone || ""}
            onChange={(e) => setSelectedSupplier({ ...selectedSupplier, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>{isEditing ? "Confirmar" : "Adicionar"}</Button>
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

export default Suppliers;
