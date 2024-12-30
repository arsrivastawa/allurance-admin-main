import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Iconify from 'src/components/iconify';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import LoadingButton from '@mui/lab/LoadingButton';
import { INVOICE_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import Image from 'src/components/image';
// import InvoiceToolbar from './manage_request-toolbar';
import * as Yup from 'yup';
import FormProvider, {
    RHFTextField,
    RHFSelect,
    RHFUpload,
} from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
// ----------------------------------------------------------------------
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Lightbox, { useLightBox } from 'src/components/lightbox';
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));
import EcommerceSaleByGender from '../overview/e-commerce/ecommerce-sale-by-gender';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { REPLICATOR_ENDPOINT } from 'src/utils/apiEndPoints';
import * as XLSX from 'xlsx';

// ----------------------------------------------------------------------

export default function InvoiceDetails({ invoice, open, onClose, id }) {

    // const [currentStatus, setCurrentStatus] = useState(invoice.status);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [currentInvoice, setcurrentInvoice] = useState([]);
    // const handleChangeStatus = useCallback((event) => {
    //     setCurrentStatus(event.target.value);
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('accessToken');
                const fetchMethod = 'GET';
                const apiUrl = `${REPLICATOR_ENDPOINT}/${id}`;
                // const response = await ManageAPIsData(apiUrl, 'GET');
                const data = {}
                data.headers = { Authorization: `Bearer ${token}` }
                const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                // if (Object.keys(responseData).length) {
                if (responseData.data && typeof responseData.data === 'object') {
                    setcurrentInvoice(responseData.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

    // DOWNLOAD CSV
    const handleExportCSV = () => {
        const mainObjectData = {
            model_no: currentInvoice.designer_id,
            quantity: currentInvoice.quantity,
            batch_number: currentInvoice.batch_number,
            rejection_reason: currentInvoice.rejection_reason
        };
        const approvedRecordsData = currentInvoice?.approvedrecords?.map(record => ({
            batch_sequence_no: record.batch_sequence_no,
            pair: record.pair == 2 ? 'No' : 'Yes',
            serial_number: record.serial_number ? `="${record.serial_number}"` : '',
            l_serial_number: record.l_serial_number ? `="${record.l_serial_number}"` : '',
            r_serial_number: record.r_serial_number ? `="${record.r_serial_number}"` : ''
        }));

        // Combining main object data and approved records data
        const csvData = [Object.keys(mainObjectData), Object.values(mainObjectData)];
        if (approvedRecordsData?.length > 0) {
            csvData.push(Object.keys(approvedRecordsData[0]));
            csvData.push(...approvedRecordsData.map(record => Object.values(record)));
        }

        // Formatting CSV content
        const csvContent = csvData.map(row => row.join(',')).join('\n');

        // Creating Blob
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Generating download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Replication_data.csv';

        // Triggering download
        a.click();

        // Cleaning up
        window.URL.revokeObjectURL(url);
    };

    // Download Box Label CSV
    const handleExportBoxLabelCSV = () => {
        const approvedRecordsData = currentInvoice?.approvedrecords?.map(record => ({
            Product_Name: currentInvoice?.marketingrecords?.[0]?.title || '',
            Base_Price: currentInvoice?.marketingrecords?.[0]?.base_price || '',
            Retail_Price: currentInvoice?.marketingrecords?.[0]?.retail_price || '',
            Bulk_Price: currentInvoice?.marketingrecords?.[0]?.bulk_price || '',
            Batch_Number: record.batch_sequence_no,
            Serial_Number: record.serial_number ? `="${record.serial_number}"` : '',
            l_serial_number: record.l_serial_number ? `="${record.l_serial_number}"` : '',
            r_serial_number: record.r_serial_number ? `="${record.r_serial_number}"` : '',
            Category_Name: currentInvoice?.marketingrecords?.[0]?.category_name || '',
        }));

        // Combining main object data and approved records data
        const csvData = [];
        if (approvedRecordsData?.length > 0) {
            csvData.push(Object.keys(approvedRecordsData[0]));
            csvData.push(...approvedRecordsData.map(record => Object.values(record)));
        }

        // Formatting CSV content
        const csvContent = csvData.map(row => row.join(',')).join('\n');

        // Creating Blob
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Generating download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Replication_box_label_data.csv';

        // Triggering download
        a.click();

        // Cleaning up
        window.URL.revokeObjectURL(url);
    }

    // Download Excel
    const handleExportExcel = () => {
        const mainObjectData = {
            quantity: currentInvoice.quantity,
            batch_number: currentInvoice.batch_number,
            rejection_reason: currentInvoice.rejection_reason
        };

        // Extracting data from the 'approvedrecords' array
        const approvedRecordsData = currentInvoice?.approvedrecords?.map(record => ({
            batch_sequence_no: record.batch_sequence_no,
            pair: record.pair == 2 ? 'No' : 'Yes',
            serial_number: record.serial_number ? `\t${record.serial_number}` : '',
            l_serial_number: record.l_serial_number ? `\t${record.l_serial_number}` : '',
            r_serial_number: record.r_serial_number ? `\t${record.r_serial_number}` : ''
        }));

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Add main object data to a worksheet
        const mainObjectWorksheet = XLSX.utils.json_to_sheet([mainObjectData]);
        XLSX.utils.book_append_sheet(workbook, mainObjectWorksheet, 'Main Data');

        // Add approved records data to a worksheet, if available
        if (approvedRecordsData && approvedRecordsData.length > 0) {
            const approvedRecordsWorksheet = XLSX.utils.json_to_sheet(approvedRecordsData);
            XLSX.utils.book_append_sheet(workbook, approvedRecordsWorksheet, 'Approved Records');
        }

        // Generate a blob from the workbook
        const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        const url = URL.createObjectURL(new Blob([excelBlob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Replication_data.xlsx';

        // Triggering download
        a.click();

        // Cleaning up
        URL.revokeObjectURL(url);
    };

    const renderList = (
        <>
            <Typography variant="h6" component="h2" sx={{ mt: 5, mb: 1 }}>
                Generated Serial Numbers
            </Typography>
            <TableContainer sx={{ overflow: 'unset', mt: 1 }}>
                <Scrollbar>
                    <Table sx={{ minWidth: 960 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width={40}>#</TableCell>
                                <TableCell sx={{ typography: 'subtitle2' }}>Serial number</TableCell>
                                <TableCell sx={{ typography: 'subtitle2' }}>Batch Number</TableCell>
                                <TableCell sx={{ typography: 'subtitle2' }}>Left Serial Number</TableCell>
                                <TableCell sx={{ typography: 'subtitle2' }}>Right Serial Number</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentInvoice?.approvedrecords?.map((record, subIndex) => (
                                <TableRow key={record.id}>
                                    <TableCell>{subIndex + 1}</TableCell>
                                    <TableCell>{record.serial_number}</TableCell>
                                    <TableCell>{currentInvoice.batch_number}</TableCell>
                                    <TableCell>{record.serial_number_left ? record.serial_number_left : "N/A"}</TableCell>
                                    <TableCell>{record.serial_number_right ? record.serial_number_right : "N/A"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Scrollbar>
            </TableContainer>
        </>
    );


    const handleRejectClick = () => {
        setOpenRejectDialog(true);
    };

    const handleCloseRejectDialog = () => {
        setOpenRejectDialog(false);
    };

    const CommentSchema = Yup.object().shape({
        comment: Yup.string().required('Comment is required'),
        batch_number: Yup.string().required('Batch Number is required'),
        quantity: Yup.string().required('Quantity is required'),
        designer_id: Yup.string().required('designer ID is required'),

    });

    const defaultValues = {
        batch_number: currentInvoice?.batch_number || '',
        quantity: currentInvoice?.quantity || '',
        designer_id: currentInvoice?.designer_id || '',
        created_at: currentInvoice?.created_at || '',
        rejection_reason: currentInvoice?.rejection_reason || '',
    };

    const methods = useForm({
        resolver: yupResolver(CommentSchema),
        defaultValues,
    });

    const {
        reset,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const statusOptionsnew = [
        { value: 'option1', label: 'Option1' },
        { value: 'option2', label: 'Option2' },
        { value: 'option3', label: 'Option3' },
        // Add more options as needed
    ];

    const slides = [
        { src: '/assets/images/about/hero.jpg' },
        // Add more images if needed
    ];

    const {
        selected: selectedImage,
        open: openLightbox,
        onOpen: handleOpenLightbox,
        onClose: handleCloseLightbox,
    } = useLightBox(slides);

    return (
        <>
            <Card sx={{ pt: 5, px: 5 }}>
                <Box
                    rowGap={5}
                    display="grid"
                    alignItems="center"
                    gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                    }}
                >
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Design Information
                        </Typography>
                        <FormProvider methods={methods}>
                            <Stack spacing={3}>
                                {defaultValues.batch_number && (<RHFTextField
                                    name="batch_number"
                                    label="Batch Number"
                                    value={defaultValues.batch_number}
                                    disabled
                                />)}
                                <RHFTextField
                                    name="designer_id"
                                    label="Model Number"
                                    value={defaultValues.designer_id}
                                    disabled
                                />
                                <RHFTextField
                                    name="quantity"
                                    label="Quantity"
                                    value={defaultValues.quantity}
                                    disabled
                                />
                                {defaultValues.rejection_reason ?
                                    <RHFTextField
                                        name="rejection_reason"
                                        label="Rejection Reason"
                                        value={defaultValues.rejection_reason}
                                        disabled
                                    />
                                    : ""}
                            </Stack>

                        </FormProvider>
                    </Stack>
                </Box>
                {currentInvoice?.updated_at && currentInvoice.record_status == 2 && (
                    <Typography variant="subtitle2" sx={{ mt: 3 }}>
                        Approved On: {fDate(currentInvoice.updated_at)}
                    </Typography>
                )}
                <Typography variant="subtitle2" sx={{ mt: 3 }}>
                    Download:
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div onClick={handleExportCSV} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                            CSV
                        </div>
                        /
                        <div onClick={handleExportExcel} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                            Excel
                        </div>
                    </div>
                </Typography>

                {currentInvoice?.approvedrecords && (
                    <Typography variant="subtitle2" sx={{ mt: 3 }}>
                        Download:
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div onClick={handleExportBoxLabelCSV} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                                Box Label CSV
                            </div>
                        </div>
                    </Typography>
                )}


                {currentInvoice?.approvedrecords && (renderList)}
                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
            </Card >
        </>
    );
}

InvoiceDetails.propTypes = {
    invoice: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
};
