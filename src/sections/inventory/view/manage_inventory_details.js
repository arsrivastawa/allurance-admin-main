import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Scrollbar from 'src/components/scrollbar'; // Ensure you have this component
import { ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { INVENTORY_ENDPOINT } from 'src/utils/apiEndPoints';
import { fDate } from 'src/utils/format-time';
import Button from '@mui/material/Button';

// Styled TableRow
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td, & th': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(1),
    textAlign: 'right',
    borderBottom: 'none',
}));

export default function InvoiceDetails({ id }) {
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [visibleRecords, setVisibleRecords] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('accessToken');
                const apiUrl = `${INVENTORY_ENDPOINT}?id=${id}`;
                const data = { headers: { Authorization: `Bearer ${token}` } };
                const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);

                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }

                const responseData = await response.json();
                if (responseData.status && responseData.data) {
                    setCurrentInvoice(responseData.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

    const handleShowMore = () => {
        setVisibleRecords((prev) => prev + 10); // Load 10 more records
    };

    if (!currentInvoice) return <div>Loading...</div>;

    return (
        <Card sx={{ pt: 5, px: 5 }}>
            <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
                {currentInvoice.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 3 }}>
                Quantity: {currentInvoice.quantity}
            </Typography>

            {currentInvoice.warehouseDetails.map((warehouse, index) => (
                <Box key={index} sx={{ mb: 5 }}>
                    {warehouse.boxElements.length > 0 && (
                        <>
                            <TableContainer sx={{ overflow: 'unset', mt: 1 }}>
                                <Scrollbar>
                                    <Table sx={{ minWidth: 960 }}>
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell width={40}>#</StyledTableCell>
                                                <StyledTableCell>Title</StyledTableCell>
                                                <StyledTableCell>Batch Number</StyledTableCell>
                                                <StyledTableCell>Serial Number</StyledTableCell>
                                                <StyledTableCell>Left Serial Number</StyledTableCell>
                                                <StyledTableCell>Right Serial Number</StyledTableCell>
                                                <StyledTableCell>Created At</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {warehouse.boxElements.slice(0, visibleRecords).map((element, elementIndex) => (
                                                <StyledTableRow key={element.id}>
                                                    <StyledTableCell>{elementIndex + 1}</StyledTableCell>
                                                    <StyledTableCell>{element.title}</StyledTableCell>
                                                    <StyledTableCell>{element.batch_sequence_no}</StyledTableCell>
                                                    <StyledTableCell>{element.serial_number}</StyledTableCell>
                                                    <StyledTableCell>{element.l_serial_number}</StyledTableCell>
                                                    <StyledTableCell>{element.r_serial_number}</StyledTableCell>
                                                    <StyledTableCell>{fDate(element?.created_at)}</StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Scrollbar>
                            </TableContainer>
                            {warehouse.boxElements.length > visibleRecords && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Button variant="contained" onClick={handleShowMore}>
                                        Show More
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            ))}

            <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
        </Card>
    );
}

InvoiceDetails.propTypes = {
    id: PropTypes.string.isRequired,
};
