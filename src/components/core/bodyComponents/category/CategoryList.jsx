import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api'; 

const Categories = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category');
        setRows(response.data.content);
      } catch (error) {
        console.error("Erro ao buscar categorias: ", error);
        setSnackbarMessage("Erro ao carregar categorias.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchCategories();
  }, []);

  const handleClickOpen = (category) => {
    setSelectedCategory(category);
    setOpen(true);
    setIsEditing(true); 
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setIsEditing(false); 
  };

  const handleDelete = async (ids) => {
    try {
      await api.delete(`/category/${ids[0]}`);
      setRows(rows.filter((row) => !ids.includes(row.id)));
      setSnackbarMessage("Categoria deletada com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao deletar categoria.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory.name) {
      setSnackbarMessage("Por favor, preencha o nome da categoria!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/category/${selectedCategory.id}`, { name: selectedCategory.name });
        setRows(rows.map((row) => (row.id === selectedCategory.id ? selectedCategory : row)));
        setSnackbarMessage("Categoria atualizada com sucesso!");
      } else {
        const newCategory = { name: selectedCategory.name };
        const response = await api.post('/category', newCategory);
        setRows([...rows, response.data.content]);
        setSnackbarMessage("Categoria adicionada com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao salvar categoria.");
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
      headerName: "Categoria",
      width: 300,
      editable: true,
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
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
        />
      </div>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Categoria"
            fullWidth
            margin="normal"
            value={selectedCategory?.name || ""}
            onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {isEditing && <Button onClick={handleSave}>Confirmar</Button>} 
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

export default Categories;
