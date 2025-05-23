import { Box, Typography } from '@mui/material';

const CoursePage = () => {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    paddingTop: 15,
                    paddingBottom: 10,
                    width: '1520px',
                    textAlign: 'center'
                }}
            >
                <Box>
                    <Typography variant="h2" gutterBottom>
                        Welcome to This CoursePage
                    </Typography>
                    <Typography variant="body1" mb={4}>
                        This is the homepage content. Feel free to customize it!
                    </Typography>

                    {[...Array(10)].map((_, i) => (
                        <Box key={i} mb={5}>
                            <Typography variant="h4" gutterBottom>
                                Welcome to This CoursePage
                            </Typography>
                            <Typography variant="body1">
                                This is the homepage content. Feel free to customize it!
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    );
};

export default CoursePage;