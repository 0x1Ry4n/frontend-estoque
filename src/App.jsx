import Inter from "../public/static/fonts/Inter.ttf";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import RootComponent from "./components/RootComponent";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/core/bodyComponents/home/Home";
import Revenue from "./components/core/bodyComponents/revenue/Revenue";
import Growth from "./components/core/bodyComponents/growth/Growth";
import Report from "./components/core/bodyComponents/report/Report";
import Setting from "./components/core/bodyComponents/settings/Setting";
import Login from "./components/auth/login/Login";
import PrivateRoute from './components/auth/privateRoute'; 
import ProductManagement from "./components/core/bodyComponents/product/ProductManagement";
import CategoryManagement from "./components/core/bodyComponents/category/CategoryManagement";
import CustomerManagement from "./components/core/bodyComponents/customer/CustomerManagement";
import SupplierManagement from "./components/core/bodyComponents/supplier/SupplierManagement";
import InventoryManagement from "./components/core/bodyComponents/inventory/InventoryManagement";
import OrderManagement from "./components/core/bodyComponents/order/OrderManagement";

function App() {
  const theme = createTheme({
    spacing: 4,
    palette: {
      mode: "light",
    },
    typography: {
      fontFamily: "Inter",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: local('Raleway'), local('Raleway-Regular'), url(${Inter}) format('woff2');
            unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
          }
        `,
      },
    },
  });

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootComponent />}>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><SupplierManagement /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><InventoryManagement /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrderManagement /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><CustomerManagement /></PrivateRoute>} />
        <Route path="/revenue" element={<PrivateRoute><Revenue /></PrivateRoute>} />
        <Route path="/growth" element={<PrivateRoute><Growth /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Setting /></PrivateRoute>} />
      </Route>
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
