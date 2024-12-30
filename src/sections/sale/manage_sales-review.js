import React, { useState } from 'react';
import { TextField, Card, CardContent, Typography, Grid, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// import { Delete } from '@mui/icons-material'; // Import Delete icon
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// Mock data for products
const mockProducts = [
    { id: 1, name: 'Product 1', price: '$10', description: 'Description of Product 1', imageUrl: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: '$20', description: 'Description of Product 2', imageUrl: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Product 3', price: '$30', description: 'Description of Product 3', imageUrl: 'https://via.placeholder.com/150' },
];

export default function Salereview() {
    const router = useRouter();
    const [serialNumber, setSerialNumber] = useState('');
    const [products, setProducts] = useState(mockProducts);
    const [selectedProducts, setSelectedProducts] = useState([]);

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
        router.push(paths.dashboard.branch_sell.product);
    };

    return (
        <>
            <Card>
                <CardContent>
                    {/* Placeholder cards to display product details */}
                    <Grid container spacing={2}>
                        {products?.map((product) => (
                            <Grid item xs={12} key={product.id}>
                                <Card>
                                    <CardContent>
                                        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                                            <Grid item>
                                                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 'auto' }} />
                                            </Grid>
                                            <Grid item xs>
                                                <Typography variant="h6">{product.name}</Typography>
                                                <Typography variant="body1">Price: {product.price}</Typography>
                                                <Typography variant="body2">{product.description}</Typography>
                                            </Grid>
                                        </Grid>
                                        <IconButton style={{ position: 'absolute', top: 0, right: 0 }} onClick={() => handleRemoveProduct(product.id)}>
                                            {/* <Delete /> */} X
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}
