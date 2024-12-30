import React, { useState } from 'react';
import { TextField, Card, CardContent, Typography, Grid, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// Mock data for products
const mockProducts = [
    { id: 1, name: 'Product 1', price: '$10', description: 'Description of Product 1', imageUrl: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: '$20', description: 'Description of Product 2', imageUrl: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Product 3', price: '$30', description: 'Description of Product 3', imageUrl: 'https://via.placeholder.com/150' },
];

export default function ProductListing() {
    const router = useRouter();
    const [serialNumber, setSerialNumber] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleButtonClick = () => {
        setProducts(mockProducts);
    };


    const handleAddProduct = (product) => {
        setSelectedProducts([...selectedProducts, product]);
    };

    const handleRemoveProduct = (productId) => {
        const updatedSelectedProducts = selectedProducts.filter(product => product.id !== productId);
        setSelectedProducts(updatedSelectedProducts);
    };

    // Function to handle button click and redirect
    const handleRedirect = () => {
        // Replace '/path/to/destination' with the actual path you want to redirect to
        router.push(paths.dashboard.branch_sell.review);
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Product Search
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Serial Number"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                    />
                    <LoadingButton sx={{ marginBottom: '1rem' }} type="submit" variant="contained" size="large" onClick={handleButtonClick}>
                        Search
                    </LoadingButton>
                    {/* Display selected products */}
                    {selectedProducts.length > 0 && (
                        <Typography variant="h5" gutterBottom>
                            Selected Products
                        </Typography>
                    )}
                    <Grid container spacing={2} sx={{ marginTop: '1rem' }}> {/* Add margin top to create space between the two grids */}
                        {selectedProducts?.map((product) => (
                            <Grid item xs={12} md={3} key={product.id}>
                                <Card sx={{ marginBottom: '1rem', position: 'relative' }}>
                                    <CardContent>
                                        <Typography variant="h6">{product.name}</Typography>
                                        <Typography variant="body1">Price: {product.price}</Typography>
                                        <Typography variant="body2">{product.description}</Typography>
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                            }}
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            x
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Placeholder cards to display product details */}
                    <Grid container spacing={2}>
                        {products?.map((product) => (
                            <Grid item xs={12} key={product.id}>
                                <Card>
                                    <CardContent>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item>
                                                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 'auto' }} />
                                            </Grid>
                                            <Grid item xs>
                                                <Typography variant="h6">{product.name}</Typography>
                                                <Typography variant="body1">Price: {product.price}</Typography>
                                                <Typography variant="body2">{product.description}</Typography>
                                            </Grid>
                                        </Grid>
                                        <LoadingButton
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleAddProduct(product)}
                                            sx={{ marginTop: '1rem' }}
                                        >
                                            Select
                                        </LoadingButton>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            <LoadingButton
                variant="contained"
                color="primary"
                sx={{ marginTop: '1rem' }} onClick={handleRedirect}
            >
                Next Page
            </LoadingButton>
        </>
    );
}








