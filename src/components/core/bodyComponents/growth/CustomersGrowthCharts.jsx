import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import api from '../../../../api'; 

export default function CustomersGrowthCharts() {
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customer'); 
        const customers = response.data.content;

        const customerCountByDay = {
          Mon: 0,
          Tue: 0,
          Wed: 0,
          Thu: 0,
          Fri: 0,
          Sat: 0,
          Sun: 0,
        };

        customers.forEach(customer => {
          const day = new Date(customer.createdAt).toLocaleString('default', { weekday: 'short' });

          if (customerCountByDay[day] !== undefined) {
            console.log(customerCountByDay[day])
            customerCountByDay[day] += 1; 
          }
        });

        const counts = Object.values(customerCountByDay);

        setCustomerData([ 
          {
            name: "New Customers",
            data: counts,
          },
        ]);
      } catch (error) {
        console.error("Erro ao buscar dados dos clientes", error);
      }
    };

    fetchCustomers();

    return () => {
      setCustomerData([]);
    };
  }, []);

  const options = {
    colors: ["#E32227"], 
    chart: {
      id: "customer-growth-chart",
      type: "line",
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Customer Growth Over the Week",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 7,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft",
        offsetY: 30,
        offsetX: 60,
      },
    },
  };

  return (
    <Box
      sx={{
        margin: 4,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <ApexCharts
        options={options}
        series={customerData}
        type="line"
        width="100%"
        height="320"
      />
    </Box>
  );
}
