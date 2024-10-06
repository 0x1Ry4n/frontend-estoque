import { Box } from "@mui/material";
import React from "react";
import ApexCharts from "react-apexcharts";

export default function TotalSales({ orders }) {
  // Contar a quantidade de vendas por data
  const salesData = orders.reduce((acc, order) => {
    const date = new Date(order.orderDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1; // Incrementa o contador para a data correspondente
    return acc;
  }, {});

  const dates = Object.keys(salesData); // Extrai as datas
  const quantities = Object.values(salesData); // Extrai as quantidades

  const options = {
    title: {
      text: "Total Sales",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
    },
    subtitle: {
      text: "Sales over time",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Helvetica, Arial",
      offsetY: -20,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 9,
      },
    },
    theme: {
      mode: "light",
    },
    chart: {
      height: 328,
      type: "line",
      zoom: {
        enabled: true,
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 2,
        blur: 4,
        opacity: 0.2,
      },
    },
    xaxis: {
      categories: dates, // Usando as datas
    },
  };

  const series = [
    {
      name: "Number of Sales",
      data: quantities, // Usando as quantidades contadas
    },
  ];

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "100%",
      }}
    >
      <ApexCharts
        options={options}
        series={series}
        height={300}
        type="line"
        width="100%"
      />
    </Box>
  );
}
