import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../../utils/utils';
import { setAuthToken } from '../../api';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  setAuthToken(token);

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;