import { Box, Typography } from '@mui/material';
import Footer from '../components/Footer';

const HomePage = () => {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    backgroundColor: '#f5f5f5',
                    padding: 3,
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Welcome to This HomePage
                </Typography>
                <Typography variant="body1">
                    This is the homepage content. Feel free to customize it!
                </Typography>
            </Box>
            <Footer />
        </>
    );
};

export default HomePage;