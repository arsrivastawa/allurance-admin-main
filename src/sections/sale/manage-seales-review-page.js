import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// Mock data for products
const mockProducts = [
    { id: 1, name: 'Product 1', price: 10, description: 'Description of Product 1', imageUrl: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: 20, description: 'Description of Product 2', imageUrl: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Product 3', price: 30, description: 'Description of Product 3', imageUrl: 'https://via.placeholder.com/150' },
];

export default function ProductReview() {
    const router = useRouter();
    const [products, setProducts] = useState(mockProducts);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleRemoveProduct = (productId) => {
        const updatedSelectedProducts = mockProducts.filter(product => product.id !== productId);
        setProducts(updatedSelectedProducts);
    };

    // Calculate total amount and total products
    const totalAmount = selectedProducts.reduce((acc, product) => acc + product.price, 0);
    const totalProducts = selectedProducts.length;

    // Function to handle button click and redirect
    const handleRedirect = () => {
        // Replace '/path/to/destination' with the actual path you want to redirect to
        router.push(paths.dashboard.branch_sell.checkout);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Selected Products
                </Typography>
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
                                            <Typography variant="body1">Price: ${product.price}</Typography>
                                            <Typography variant="body2">{product.description}</Typography>
                                        </Grid>
                                        <Grid item>
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
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <div style={{ marginTop: '20px' }}>
                    <Typography variant="h6">
                        Total Products: {totalProducts}
                    </Typography>
                    <Typography variant="h6">
                        Total Amount: ${totalAmount}
                    </Typography>
                </div>
                <LoadingButton
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: '1rem' }}
                    onClick={handleRedirect}
                >
                    Proceed to Checkout
                </LoadingButton>
            </CardContent>
        </Card>
    );
}
