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
import EcommerceSaleByGender from '../../overview/e-commerce/ecommerce-sale-by-gender';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { REPLICATOR_ENDPOINT } from 'src/utils/apiEndPoints';
// ----------------------------------------------------------------------

export default function InvoiceDetails({ id }) {

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
                const apiUrl = `${REPLICATOR_ENDPOINT}?id=${id}`;
                // const response = await ManageAPIsData(apiUrl, 'GET');
                const data = {}
                data.headers = { Authorization: `Bearer ${token}` }
                const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (Object.keys(responseData).length) {
                    setcurrentInvoice(responseData.data[0]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

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
                                    <TableCell>{record.batch_sequence_no}</TableCell>
                                    <TableCell>{record.l_serial_number ? record.l_serial_number : "N/A"}</TableCell>
                                    <TableCell>{record.r_serial_number ? record.r_serial_number : "N/A"}</TableCell>
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
