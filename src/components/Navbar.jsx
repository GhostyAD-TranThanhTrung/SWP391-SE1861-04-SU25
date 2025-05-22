import React from 'react';
import { AppBar, Toolbar, Button, Box, IconButton, TextField, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Logo from '../images/Logo1.png';

const Navbar = () => {
    return (
        <AppBar position="fixed" sx={{ width: '100vw', top: 0, left: 0, zIndex: 1100, backgroundColor: '#E0F7FA' }}>
            <Toolbar
                sx={{
                    position: 'relative',
                    backgroundColor: '#66B0C6',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                {/* Logo on the left */}
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={Logo}
                        alt="Logo"
                        style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
                    />
                </Box>

                {/* Centered navigation links */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: '30%',
                        transform: 'translateX(-55%)',
                        display: 'flex',
                        gap: 3,
                    }}
                >
                    <Button color="inherit" component={Link} to="/booking" sx={{ '&:hover': { color: 'silver' }, color: 'black' }}>
                        Booking
                    </Button>
                    <Button color="inherit" component={Link} to="/courses" sx={{ '&:hover': { color: 'silver' }, color: 'black' }}>
                        Courses
                    </Button>
                    <Button color="inherit" component={Link} to="/test" sx={{ '&:hover': { color: 'silver' }, color: 'black' }}>
                        Test
                    </Button>
                    <Button color="inherit" component={Link} to="/blog" sx={{ '&:hover': { color: 'silver' }, color: 'black' }}>
                        Blog
                    </Button>
                    <Button color="inherit" component={Link} to="/about" sx={{ '&:hover': { color: 'silver' }, color: 'black' }}>
                        About Us
                    </Button>
                </Box>

                {/* Search, Login, and Sign Up on the right */}
                <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: 2 }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'white' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: 'silver' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                                color: 'white',
                                backgroundColor: '#66B0C6',
                            },
                        }}
                        sx={{
                            '& .MuiInputBase-input': { color: 'white' },
                            marginRight: 1,
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                            sx={{
                                '&:hover': { color: 'black' },
                                backgroundColor: '#6DCCBF',
                                borderRadius: 8,
                                width: '100px',
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/signup"
                            sx={{
                                '&:hover': { color: 'black' },
                                backgroundColor: '#6DCCBF',
                                borderRadius: 8,
                                width: '100px',
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;