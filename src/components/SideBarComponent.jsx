import { useState } from "react";
import "../../public/styles/links.css";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
  Collapse,
} from "@mui/material";
import {
  HomeOutlined,
  Inventory2Outlined,
  SettingsOutlined,
  DescriptionOutlined,
  MonetizationOnOutlined,
  CardTravelOutlined,
  TrendingUpOutlined,
  PeopleAltOutlined,
  CategoryOutlined,
  ListAltOutlined,
  OutboxOutlined,
  AccountCircleOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

export default function SideBarComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;

  const sideBarComponent = [
    { title: "Home", route: "home", component: <HomeOutlined /> },
    { title: "Fornecedores", route: "suppliers", component: <OutboxOutlined /> },
    { title: "Clientes", route: "customers", component: <PeopleAltOutlined /> },
    { title: "Categorias", route: "categories", component: <CategoryOutlined /> },
    { title: "Produtos", route: "products", component: <ListAltOutlined /> },
    { title: "Inventário", route: "inventory", component: <Inventory2Outlined /> },
    { title: "Saídas", route: "orders", component: <CardTravelOutlined /> },
    { title: "Usuários", route: "create-user", component: <AccountCircleOutlined /> }, 
    { title: "Receita", route: "revenue", component: <MonetizationOnOutlined /> },
    { title: "Crescimento", route: "growth", component: <TrendingUpOutlined /> },
    { title: "Relatórios", route: "qrcode-generator", component: <DescriptionOutlined /> },
    { title: "Configurações", route: "settings", component: <SettingsOutlined /> },
  ];  

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);

  const handleSelectedComponent = (index) => {
    setSelected(index);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        bgcolor: "#ffffff",
        height: "100vh",
        boxShadow: 2,
        p: 2,
        zIndex: 1000,
        transition: "width 0.3s",
        width: open ? "250px" : "60px",
      }}
    >
      <IconButton onClick={toggleSidebar} sx={{ mt: 15 }}>
        {open ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
      
      <Collapse in={open}>
        <List>
          {sideBarComponent.map((comp, index) => (
            <ListItem disablePadding key={index}>
              <Box width="100%">
                <ListItemButton
                  onClick={() => {
                    handleSelectedComponent(index);
                    navigate(comp.route.toLowerCase());
                  }}
                  selected={index === selected && currentPage === "/" + comp.route.toLowerCase()}
                  sx={{
                    mb: 2,
                    bgcolor: selected === index ? "#e0f2f1" : "transparent",
                    borderRadius: 2,
                    transition: "background-color 0.2s",
                    '&:hover': {
                      bgcolor: "#b2dfdb",
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    color: selected === index ? "#00796b" : "inherit",
                  }}>
                    <IconButton>
                      {comp.component}
                    </IconButton>
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={comp.title}
                      primaryTypographyProps={{
                        fontSize: "medium",
                        fontWeight: selected === index ? "bold" : "normal",
                        color: selected === index ? "#00796b" : "inherit",
                      }}
                    />
                  )}
                </ListItemButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
