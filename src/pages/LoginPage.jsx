import React from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { styled } from '@mui/system';
import PreventionImage from '../images/Prevention.jpg'; // Cập nhật đường dẫn đúng

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
                backgroundImage: `url(${PreventionImage})`, // Move background image here
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Left: Login form container */}
            <Box
                sx={{
                    width: { xs: '100%', md: '50%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 360,
                        padding: 4,
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h4" gutterBottom>
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

                    <Box sx={{ marginTop: 2 }}>
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

            {/* Right decorative side */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: 'none', md: 'block' },
                    backgroundColor: 'rgba(245, 245, 245, 0.5)', // Optional: Add transparency to see the background image
                }}
            />
        </Box>
    );
};

export default LoginPage;