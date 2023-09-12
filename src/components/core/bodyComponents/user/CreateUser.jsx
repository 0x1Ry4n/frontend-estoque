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
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Lock,
  Save,
  PlayArrow,
  Stop,
} from "@mui/icons-material";
import api from "../../../../api";
import { useForm, Controller } from "react-hook-form";
import Webcam from "react-webcam";

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

  // Variáveis para captura de imagem da face
  const webcamRef = useRef(null);
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [status, setStatus] = useState("Aguardando rosto...");
  const [userFaceImage, setUserFaceImage] = useState(null); // Variável para armazenar a imagem da face
  const [faceVerificationStatus, setFaceVerificationStatus] = useState(""); // Status da verificação da face

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

      if (response.status === 200) {
        if (typeof onUserAdded === "function") {
          onUserAdded(response.data);
        }

        setSnackbarSeverity("success");
        setSnackbarMessage("Usuário criado com sucesso.");
        setSnackbarOpen(true);
        reset();
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Erro ao criar usuário");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const verifyFace = async () => {
    try {
      const response = await api.post("/auth/verify-face", {
        username: "natalialinda",  // Substitua com o nome de usuário real
        image: userFaceImage,          // A imagem capturada
      });

      if (response.status === 200) {
        setFaceVerificationStatus("Rosto verificado com sucesso!");
        setSnackbarSeverity("success");
      } else {
        setFaceVerificationStatus("Falha na verificação do rosto.");
        setSnackbarSeverity("error");
      }

      setSnackbarMessage(response.data.message || "Verificação concluída.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setFaceVerificationStatus("Erro ao verificar rosto.");
      setSnackbarSeverity("error");
      setSnackbarMessage("Erro na verificação da face.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const captureFace = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setUserFaceImage(imageSrc);
      setStatus("Rosto capturado, pronto para enviar.");
      setIsCapturingFace(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isCapturingFace) {
      interval = setInterval(() => {
        captureFace();
      }, 1000); // Captura um frame por segundo
    }
    return () => clearInterval(interval);
  }, [isCapturingFace]);

  return (
    <Box sx={{ maxWidth: "100%", padding: 3, margin: "auto" }}>
      <Paper
        elevation={4}
        sx={{ padding: 4, borderRadius: 2, backgroundColor: "#f5f5f5" }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AccountCircle sx={{ mr: 1 }} />
          Criar Novo Usuário
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="username"
                control={control}
                defaultValue=""
                rules={{
                  required: "O nome de usuário é obrigatório.",
                  minLength: {
                    value: 3,
                    message:
                      "O nome de usuário deve ter pelo menos 3 caracteres.",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    label="Nome de Usuário"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.username}
                    helperText={errors.username ? errors.username.message : ""}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                rules={{
                  required: "O e-mail é obrigatório.",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "O e-mail deve ser válido.",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    label="E-mail"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ""}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="password"
                control={control}
                defaultValue=""
                rules={{
                  required: "A senha é obrigatória.",
                  minLength: {
                    value: 6,
                    message: "A senha deve ter pelo menos 6 caracteres.",
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
                    helperText={errors.password ? errors.password.message : ""}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Webcam ou imagem capturada dentro do formulário */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Configurar Face
              </Typography>
              {userFaceImage ? (
                <img
                  src={userFaceImage}
                  alt="Foto Capturada"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    borderRadius: "8px",
                    marginTop: "20px",
                    marginBottom: "10px",
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{ facingMode: "user" }}
                  style={{
                    maxWidth: "500px",
                    height: "auto",
                    marginTop: "20px",
                    marginBottom: "10px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    borderRadius: "8px",
                  }}
                />
              )}
              <Button
                variant="contained"
                color={isCapturingFace ? "error" : "primary"}
                onClick={() => {
                  if (isCapturingFace) {
                    setIsCapturingFace(false); // Parar captura se estiver gravando
                  } else {
                    setIsCapturingFace(true); // Iniciar captura se não estiver
                    setUserFaceImage(null); // Limpar imagem anterior se houver
                    setStatus("Aguardando rosto...");
                  }
                }}
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 20px",
                  borderRadius: "50px",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: isCapturingFace ? "#ff0000" : "#3f51b5",
                  },
                }}
              >
                {isCapturingFace ? (
                  <Stop sx={{ mr: 1 }} />
                ) : (
                  <PlayArrow sx={{ mr: 1 }} />
                )}
                {isCapturingFace ? "Parar Captura" : "Iniciar Captura"}
              </Button>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {status}
              </Typography>
              {userFaceImage && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={verifyFace}
                  sx={{ mt: 2 }}
                >
                  Verificar Face
                </Button>
              )}
              <Typography variant="body2" sx={{ mt: 2, fontWeight: "bold" }}>
                {faceVerificationStatus}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                width: "100%",
                maxWidth: "250px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Save sx={{ mr: 1 }} />
              Criar Usuário
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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
