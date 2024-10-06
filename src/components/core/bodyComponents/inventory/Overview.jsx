import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

const InventoryOverview = ({ totalProducts, todaySales, yesterdaySales, totalSales, reservedProducts, stockIssues }) => {
  return (
    <Box sx={{ mb: 4, backgroundColor: '#f5f5f5', borderRadius: 2, padding: 2, mt: 14 }}>
      <Typography variant="h5" sx={{ ml: 3, mt: 2, fontWeight: 'bold' }}>
        Resumo do Inventário
      </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total de Produtos</TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {totalProducts}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Vendas Hoje</TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {todaySales}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Vendas Ontem</TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {yesterdaySales}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Total de Vendas</TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {totalSales}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Produtos Reservados</TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {reservedProducts}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Problemas de Estoque</TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  {stockIssues}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryOverview;
