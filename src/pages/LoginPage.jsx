import React from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { styled } from '@mui/system';
import PreventionImage from '../images/Prevention.jpg';

const GoogleButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #ddd',
    textTransform: 'none',
    marginTop: theme.spacing(1.5),
    '&:hover': {
        backgroundColor: '#f5f5f5',
    },
}));

const LoginPage = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                width: '100vw',
                height: '100vh',
                backgroundImage: `url(${PreventionImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                justifyContent: 'flex-end',
                alignItems: 'center',
            }}
        >
            {/* Ô blur chiếm nửa phải màn hình */}
            <Box
                sx={{
                    width: '50%', // chiếm nửa màn hình
                    height: '100%',
                    padding: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '-4px 0 16px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 360 }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Log in
                    </Typography>

                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    >
                        Log in
                    </Button>

                    <GoogleButton
                        variant="outlined"
                        fullWidth
                        startIcon={
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                style={{ width: 20 }}
                            />
                        }
                    >
                        Log in with Google
                    </GoogleButton>

                    <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            You don't have an account?{' '}
                            <Link href="#" underline="hover">
                                Register
                            </Link>
                        </Typography>
                        <Typography variant="body2">
                            You forgot password?{' '}
                            <Link href="#" underline="hover">
                                Forget password
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
