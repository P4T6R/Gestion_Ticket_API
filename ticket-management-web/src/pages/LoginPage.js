import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  CssBaseline,
  Link,
  Fade,
  Grow
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  EmailOutlined as EmailIcon
} from '@mui/icons-material';

// Illustration SVG pour un look moderne
const LoginIllustration = () => (
    <Box sx={{ p: 4, display: { xs: 'none', sm: 'block' } }}>
        <svg width="100%" viewBox="0 0 500 500">
            <defs>
                <linearGradient id="illustration-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a8b5ff" />
                    <stop offset="100%" stopColor="#a178ff" />
                </linearGradient>
            </defs>
            <g opacity="0.8">
                <path fill="url(#illustration-gradient)" d="M250 50C139.75 50 50 139.75 50 250S139.75 450 250 450 450 360.25 450 250 360.25 50 250 50zm0 360c-93.75 0-170-76.25-170-170S156.25 80 250 80s170 76.25 170 170-76.25 170-170 170z"/>
                <path fill="#FFFFFF" d="M250 180c-38.6 0-70 31.4-70 70s31.4 70 70 70 70-31.4 70-70-31.4-70-70-70zm0 110c-22.05 0-40-17.95-40-40s17.95-40 40-40 40 17.95 40 40-17.95 40-40 40z"/>
                <path fill="rgba(255,255,255,0.5)" d="M150 150h200v200H150z" transform="rotate(45 250 250)"/>
            </g>
        </svg>
    </Box>
);

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(credentials.email, credentials.password);
      navigate('/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      {/* Colonne de gauche : Visuel */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Fade in={true} timeout={1000}>
            <Box>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    TicketFlow
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
                    Votre solution de gestion de tickets simplifiée.
                </Typography>
                <LoginIllustration />
            </Box>
        </Fade>
      </Grid>

      {/* Colonne de droite : Formulaire */}
      <Grid 
        item 
        xs={12} 
        sm={8} 
        md={5} 
        component={Paper} 
        elevation={6} 
        square 
        sx={{ 
            display: 'flex', 
            alignItems: 'center',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
                boxShadow: (theme) => theme.shadows[10]
            }
        }}
      >
        <Grow in={true} timeout={1200}>
            <Box
                sx={{
                    my: 8,
                    mx: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
                    Connexion
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adresse email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={credentials.email}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontWeight: 'bold',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: (theme) => theme.shadows[6]
                                }
                            }}
                        >
                            Se connecter
                        </Button>
                        {loading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'primary.main',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="#" variant="body2">
                                Mot de passe oublié ?
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Grow>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
