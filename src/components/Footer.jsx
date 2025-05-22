import { Box, Typography, Divider } from '@mui/material';
import { Facebook, Instagram, LinkedIn, Twitter, YouTube } from '@mui/icons-material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#6FB7BD',
                color: 'black',
                px: 3,
                pb: 1,
                borderTop: '1px solid black',
                width: '100vw',
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1300,
                boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    mb: 3,
                    maxWidth: '1200px',
                    margin: '0 auto',
                    gap: 2,
                    mt: 4,
                }}
            >
                {/* Courses Section */}
                <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1A3C47' }}>
                        Courses
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        Free Courses
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" mt={2} gutterBottom sx={{ color: '#1A3C47' }}>
                        Test
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        Take the Test
                    </Typography>
                </Box>

                {/* Booking Section */}
                <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1A3C47' }}>
                        Booking
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        Online consultation with experts
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" mt={2} gutterBottom sx={{ color: '#1A3C47' }}>
                        News
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        Events & News
                    </Typography>
                </Box>

                {/* About Section */}
                <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1A3C47' }}>
                        About
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        Our Mission
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        Contact Us
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                        FAQ
                    </Typography>
                </Box>
            </Box>

            {/* Divider */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Divider sx={{ backgroundColor: '#1A3C47', width: '80%', my: 1, borderBottomWidth: 2 }} />
            </Box>

            {/* Bottom Section with Text and Icons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3 }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#1A3C47', ml: 15 }}>
                    © Summer 2025 – SWP391 | All Rights Reserved
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mr: 15 }}>
                    <Facebook sx={{ color: '#3b5998', fontSize: 28, transition: 'color 0.3s', '&:hover': { color: '#2a4373' } }} />
                    <Instagram sx={{ color: '#E1306C', fontSize: 28, transition: 'color 0.3s', '&:hover': { color: '#b12656' } }} />
                    <LinkedIn sx={{ color: '#0077B5', fontSize: 28, transition: 'color 0.3s', '&:hover': { color: '#005f8f' } }} />
                    <Twitter sx={{ color: '#1DA1F2', fontSize: 28, transition: 'color 0.3s', '&:hover': { color: '#1781c2' } }} />
                    <YouTube sx={{ color: '#FF0000', fontSize: 28, transition: 'color 0.3s', '&:hover': { color: '#cc0000' } }} />
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;