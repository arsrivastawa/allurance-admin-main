import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Grid, TableBody, TableCell, TableHead, Button, TextField } from '@mui/material';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

export default function ProductNewEditForm({ invoice }) {
    const [visibleItems, setVisibleItems] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(invoice?.data || []);

    useEffect(() => {
        setFilteredData(invoice?.data || []);
    }, [invoice]);

    const handleViewMore = () => {
        setVisibleItems((prev) => prev + 10);
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredData(
            invoice?.data.filter(
                (item) =>
                    item.serial_number.toLowerCase().includes(term) ||
                    item.box_name.toLowerCase().includes(term) ||
                    item.batch_number.toLowerCase().includes(term) ||
                    item.carton_title.toLowerCase().includes(term)
            )
        );
    };

    return (
        <>
            <Card sx={{ pt: 5, px: 5, py: 5 }}>
                <Box
                    rowGap={5}
                    display="grid"
                    alignItems="center"
                    gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                >
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Product Stock Information
                        </Typography>
                    </Stack>
                    <TextField
                        sx={{
                            mb: 2
                        }}
                        fullWidth
                        label="Search"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Batch Number</TableCell>
                            <TableCell>Carton Name</TableCell>
                            <TableCell>Box Name</TableCell>
                            <TableCell>Serial Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length === 0 ? ( // If no data found after filtering
                            <TableRow>
                                <TableCell colSpan={4} align="center">No data found</TableCell>
                            </TableRow>
                        ) : (
                            // Render filtered data
                            filteredData.slice(0, visibleItems).map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item?.batch_number}</TableCell>
                                    <TableCell>{item?.carton_title}</TableCell>
                                    <TableCell>{item?.box_name}</TableCell>
                                    <TableCell>{item?.serial_number}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {visibleItems < filteredData.length && (
                    <Box sx={{ textAlign: 'left', mt: 3 }}>
                        <Button variant="contained" onClick={handleViewMore}>
                            View More
                        </Button>
                    </Box>
                )}
                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
            </Card>
        </>
    );
}

ProductNewEditForm.propTypes = {
    invoice: PropTypes.object.isRequired,
};
