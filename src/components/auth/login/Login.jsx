import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  useMediaQuery,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email, Lock, Visibility, VisibilityOff, Face, CameraAlt, Refresh } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import LoginIcon from '@mui/icons-material/Login';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import api from '../../../api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionInterval = useRef(null);

  const isMobile = useMediaQuery('(max-width:600px)');

  // Carrega os modelos de face treinados da lib faceapi
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('Modelos carregados com sucesso!');
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
      }
    };
    loadModels();

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  // detecta a face exibida na webcam, desenhando os pontos dela em tempo real
  const detectFace = async () => {
    if (!webcamRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    
    if (video.readyState !== 4) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const detections = await faceapi.detectAllFaces(
      video, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();
    
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detections.length > 0) {
      setIsFaceDetected(true);
      faceapi.draw.drawDetections(canvas, detections);
      faceapi.draw.drawFaceLandmarks(canvas, detections);
    } else {
      setIsFaceDetected(false);
    }
  };

  // verificação sobre intervalo
  const startFaceVerification = () => {
    setIsVerifyingFace(true);
    setFaceImage(null);
    
    setTimeout(() => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      detectionInterval.current = setInterval(detectFace, 300);
    }, 500);
  };

  const stopFaceVerification = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setIsVerifyingFace(false);
  };


  // realiza o login se estiver tudo conforme
  const handleLogin = async (e) => {
    e.preventDefault();

    if (userType === 'user' && !faceImage) {
      setSnackbarMessage("Por favor, verifique o rosto antes de continuar.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const isAuthenticated = await login(email, password);
      if (isAuthenticated) {
        navigate('/home');
      } else {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err) {
      setError('Erro ao tentar entrar. Tente novamente mais tarde.');
    }
  };

  // limpa o canvas com os pontos marcados da face anterior e inicia uma nova captura
  const captureFace = () => {
    if (webcamRef.current && isFaceDetected) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const imageSrc = webcamRef.current.getScreenshot();
      setFaceImage(imageSrc);
      
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    }
  };

  // verifica se a face capturada coincide com a face do usuário registrado no sistema.
  const verifyFace = async () => {
    try {
      const response = await api.post('/auth/verify-face', {
        email,
        image: faceImage,
      });
  
      if (response.status === 200) {
        if (response.data.error) {
          setSnackbarMessage(`Erro: ${response.data.details}`);
          setSnackbarOpen(true);
          setFaceImage(null); 
          setIsVerifyingFace(false);
          return;
        }

        if (!response.data.verified) {
          setSnackbarMessage(`Rosto incompatível com o cadastro de usuário!`);
          setSnackbarOpen(true);
          setFaceImage(null); 
          return;
        }
  
        setSnackbarMessage("Rosto verificado com sucesso!");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Falha na verificação do rosto.");
        setSnackbarOpen(true);
        setFaceImage(null); 
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erro ao verificar rosto.";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      setFaceImage(null); 
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#e0f2f1" px={2}>
      <Box bgcolor="#fff" p={isMobile ? 4 : 12} borderRadius={4} boxShadow={4} width={isMobile ? '90%' : '500px'}>
        <Typography variant="h5" mb={3} textAlign="center" color="#00796b" fontWeight="bold">
          <LoginIcon sx={{ mr: 1 }} /> Acesse sua conta
        </Typography>

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        {!isVerifyingFace ? (
          <form onSubmit={handleLogin}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-type-label">Tipo de Login</InputLabel>
              <Select
                labelId="user-type-label"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                label="Tipo de Login"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#00796b' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#00796b' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {userType === 'user' && (
              <Button
                variant={faceImage ? "contained" : "outlined"}
                color={faceImage ? "success" : "secondary"}
                fullWidth
                sx={{ mt: 2, py: 1.2 }}
                onClick={startFaceVerification}
                startIcon={<Face />}
                disabled={!modelsLoaded}
              >
                {faceImage 
                  ? "Rosto capturado" 
                  : modelsLoaded 
                    ? "Iniciar Reconhecimento Facial" 
                    : "Carregando modelos..."}
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, bgcolor: '#00796b', '&:hover': { bgcolor: '#004d40' }, py: 1.5 }}
              disabled={userType === 'user' && !faceImage}
            >
              Entrar
            </Button>
          </form>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight="bolder" textAlign="center" mb={2}>
              Verificação Facial
            </Typography>

            {faceImage ? (
              <Box textAlign="center">
                <img
                  src={faceImage}
                  alt="Face capturada"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
                <Box display="flex" justifyContent="center" gap={2}>
                  <Button 
                    variant="contained" 
                    onClick={verifyFace} 
                    startIcon={<Face />} 
                    color="success"
                  >
                    Verificar
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={startFaceVerification}
                    startIcon={<Refresh />}
                  >
                    Tentar Novamente
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box textAlign="center">
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '400px',
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2
                }}>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    height="auto"
                    videoConstraints={{ 
                      facingMode: 'user',
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    }}
                  />
                </Box>
                <Button 
                  variant="contained" 
                  onClick={captureFace} 
                  startIcon={<CameraAlt />} 
                  sx={{ py: 1.2 }}
                  disabled={!isFaceDetected}
                >
                  {isFaceDetected ? "Capturar Foto" : "Nenhum rosto detectado"}
                </Button>
              </Box>
            )}

            <Button 
              fullWidth 
              sx={{ mt: 2 }} 
              onClick={stopFaceVerification}
            >
              Voltar para Login
            </Button>

            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              {isFaceDetected 
                ? "Rosto detectado! Posicione-se corretamente e clique em Capturar Foto"
                : "Posicione seu rosto na câmera"}
            </Typography>
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarMessage.includes('sucesso') ? 'success' : 'error'}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Login;