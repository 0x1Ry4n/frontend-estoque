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
    MenuItem,
    Select,
    InputAdornment,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import InputMask from 'react-input-mask';
import Swal from 'sweetalert2';
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
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/supplier');
            setRows(response.data.content);
            console.log(response.data.content);
        } catch (error) {
            console.error("Erro ao buscar fornecedores: ", error);
            setSnackbarMessage("Erro ao carregar fornecedores.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleClickOpen = (supplier) => {
        setSelectedSupplier(supplier || {});
        setOpen(true);
        setIsEditing(!!supplier);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSupplier(null);
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
                await api.delete(`/supplier/${ids[0]}`);
                setRows(rows.filter((row) => !ids.includes(row.id)));
                setSnackbarMessage("Fornecedor deletado com sucesso!");
                setSnackbarSeverity("success");
            } catch (error) {
                setSnackbarMessage(`Erro ao deletar fornecedor: ${error.response?.data?.message || error.message}`);
                setSnackbarSeverity("error");
            } finally {
                setSnackbarOpen(true);
            }
        }
    };

    const handleSave = async () => {
        const { name, email, phone, socialReason, cnpj, contactPerson, cep, website, communicationPreference } = selectedSupplier;

        if (!name || !socialReason || !cnpj || !communicationPreference) {
            setSnackbarMessage("Por favor, preencha todos os campos obrigatórios!");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            if (isEditing) {
                await api.patch(`/supplier/${selectedSupplier.id}`, selectedSupplier);
                setRows(rows.map((row) => (row.id === selectedSupplier.id ? selectedSupplier : row)));
                setSnackbarMessage("Fornecedor atualizado com sucesso!");
            } else {
                const response = await api.post('/supplier', selectedSupplier);
                setRows([...rows, response.data.content]);
                setSnackbarMessage("Fornecedor adicionado com sucesso!");
            }
            setSnackbarSeverity("success");
        } catch (error) {
            setSnackbarMessage(`Erro ao salvar fornecedor: ${error.response?.data?.message || error.message}`);
            setSnackbarSeverity("error");
        } finally {
            handleClose();
            setSnackbarOpen(true);
        }
    };

    const handleRefresh = () => {
        fetchSuppliers();
        setSnackbarMessage("Lista de fornecedores atualizada!");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "name", headerName: "Nome", width: 150 },
        { field: "socialReason", headerName: "Razão Social", width: 150 },
        { field: "cnpj", headerName: "CNPJ", width: 150 },
        { field: "email", headerName: "E-mail", width: 200 },
        { field: "phone", headerName: "Telefone", width: 150 },
        { field: "createdAt", headerName: "Data Criação", width: 150, valueGetter: (params) => new Date(params.value).toLocaleDateString("pt-BR") },
        { field: "actions", headerName: "Ações", width: 150, renderCell: (cellData) => (
            <>
                <Button onClick={() => handleClickOpen(cellData.row)}>
                    <EditIcon />
                </Button>
                <Button onClick={() => handleDelete([cellData.row.id])}>
                    <DeleteIcon />
                </Button>
            </>
        )}
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} sx={{ mb: 2 }}>
                Atualizar Lista
            </Button>
            <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <DataGrid rows={rows} columns={columns} />
            </div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? "Editar Fornecedor" : "Adicionar Fornecedor"}</DialogTitle>
                <DialogContent>
                    <TextField label="Nome" fullWidth margin="normal" value={selectedSupplier?.name || ""} onChange={(e) => setSelectedSupplier({ ...selectedSupplier, name: e.target.value })} required />
                    {/* Add other fields */}
                    <Select fullWidth margin="normal" value={selectedSupplier?.communicationPreference || ""} onChange={(e) => setSelectedSupplier({ ...selectedSupplier, communicationPreference: e.target.value })} required>
                        <MenuItem value="" disabled>Selecione uma preferência</MenuItem>
                        <MenuItem value="EMAIL">Email</MenuItem>
                        <MenuItem value="PHONE">Telefone</MenuItem>
                    </Select>
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
