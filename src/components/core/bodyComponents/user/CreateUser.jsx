import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Lock,
  Save,
  CameraAlt,
  Refresh,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";
import api from '../../../../api';

const CreateUser = ({ onUserAdded }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userFaceImage, setUserFaceImage] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const canvasRef = useRef(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const detectionInterval = useRef(null);

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/register/user", {
        username: data.username,
        email: data.email,
        password: data.password,
        role: "USER",
        status: "ACTIVE",
        faceImage: userFaceImage,
      });

      if (response.status === 201) {
        if (typeof onUserAdded === "function") {
          onUserAdded(response.data);
        }

        setSnackbarSeverity("success");
        setSnackbarMessage("Usuário criado com sucesso!");
        setSnackbarOpen(true);
        reset();
        setUserFaceImage(null);
      }

    } catch (error) {
      let message = error.response?.data?.error || "Erro desconhecido ao criar o usuário.";
      
      setSnackbarSeverity("error");
      setSnackbarMessage(message);
      setSnackbarOpen(true);
      setUserFaceImage(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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

  const startCamera = async () => {
    setIsCameraActive(true);
    setUserFaceImage(null);
    
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    detectionInterval.current = setInterval(detectFace, 300);
  };

  const stopCamera = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFace = async () => {
    if (webcamRef.current && isFaceDetected) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const imageSrc = webcamRef.current.getScreenshot();
      setUserFaceImage(imageSrc);
      
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", padding: 3 }}>
      <Paper elevation={4} sx={{ padding: 10, borderRadius: 3 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            color: "black",
          }}
        >
          <AccountCircle sx={{ mr: 2, color: "black" }} />
          Cadastro de Usuário
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ p: 10 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", color: "black" }}>
                    Informações Pessoais
                  </Typography>

                  <Controller
                    name="username"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Nome de usuário obrigatório",
                      minLength: {
                        value: 3,
                        message: "Mínimo 3 caracteres",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        label="Nome de Usuário"
                        fullWidth
                        variant="outlined"
                        {...field}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle sx={{ mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "E-mail obrigatório",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "E-mail inválido",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        label="E-mail"
                        fullWidth
                        variant="outlined"
                        {...field}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={{ mb: 3, mt: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Senha obrigatória",
                      minLength: {
                        value: 6,
                        message: "Mínimo 6 caracteres",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        label="Senha"
                        type="password"
                        fullWidth
                        variant="outlined"
                        {...field}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        sx={{ mb: 2, mt: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ mr: 1 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={!userFaceImage}
                      sx={{
                        minWidth: "200px",
                        py: 1.5,
                        fontSize: "1rem",
                      }}
                      startIcon={<Save />}
                    >
                      Finalizar Cadastro
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", color: "black" }}>
                    Cadastro Facial
                  </Typography>

                  <Box sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "300px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    p: 2
                  }}>
                    {!isCameraActive && !userFaceImage ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={startCamera}
                        startIcon={<CameraAlt />}
                        sx={{ py: 2 }}
                        disabled={!modelsLoaded}
                      >
                        {modelsLoaded ? "Iniciar Câmera" : "Carregando modelos..."}
                      </Button>
                    ) : (
                      <>
                        <Box sx={{
                          width: "100%",
                          maxWidth: "600px",
                          mb: 2,
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: 'relative',
                        }}>
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            height="auto"
                            videoConstraints={{ 
                              facingMode: "user",
                              width: { ideal: 1280 },
                              height: { ideal: 720 }
                            }}
                            style={{
                              display: userFaceImage ? "none" : "block",
                              width: "100%",
                              height: "auto"
                            }}
                            mirrored={true}
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
                          {userFaceImage && (
                            <img
                              src={userFaceImage}
                              alt="Face capturada"
                              style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "8px",
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                          {!userFaceImage ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={captureFace}
                              startIcon={<CameraAlt />}
                              disabled={!isFaceDetected}
                            >
                              {isFaceDetected ? "Capturar Foto" : "Nenhum rosto detectado"}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={startCamera}
                              startIcon={<Refresh />}
                            >
                              Tirar Outra Foto
                            </Button>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                    {userFaceImage
                      ? "Foto capturada com sucesso!"
                      : isCameraActive
                        ? isFaceDetected
                          ? "Rosto detectado! Clique em Capturar Foto"
                          : "Posicione seu rosto na câmera"
                        : "Clique para iniciar a câmera"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateUser;