import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';

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
import EcommerceSaleByGender from '../overview/e-commerce/ecommerce-sale-by-gender';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { DESIGNER_ENDPOINT, REPLICATOR_ENDPOINT } from 'src/utils/apiEndPoints';
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
                const apiUrl = `${DESIGNER_ENDPOINT}?id=${id}`;
                const response = await ManageAPIsData(apiUrl, 'GET');

                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (Object.keys(responseData).length) {
                    setcurrentInvoice(responseData.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);


    const renderTotal = (
        <>
            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>
                    <Box sx={{ mt: 2 }} />
                    Subtotal
                </TableCell>
                <TableCell width={120} sx={{ typography: 'subtitle2' }}>
                    <Box sx={{ mt: 2 }} />
                    {/* {fCurrency(invoice.subTotal)} */}
                </TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>Shipping</TableCell>
                <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
                    {/* {fCurrency(-invoice.shipping)} */}
                </TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
                <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
                    {/* {fCurrency(-invoice.discount)} */}
                </TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>Taxes</TableCell>
                {/* <TableCell width={120}>{fCurrency(invoice.taxes)}</TableCell> */}
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
                <TableCell width={140} sx={{ typography: 'subtitle1' }}>
                    {/* {fCurrency(invoice.totalAmount)} */}
                </TableCell>
            </StyledTableRow>
        </>
    );

    const renderFooter = (
        <Grid container>
            <Grid xs={12} md={9} sx={{ py: 3 }}>
                <Typography variant="subtitle2">NOTES</Typography>

                <Typography variant="body2">
                    We appreciate your business. Should you need us to add VAT or extra notes let us know!
                </Typography>
            </Grid>

            <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
                <Typography variant="subtitle2">Have a Question?</Typography>

                <Typography variant="body2">support@minimals.cc</Typography>
            </Grid>
        </Grid>
    );

    const renderList = (
        <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
            <Scrollbar>
                <Table sx={{ minWidth: 960 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell width={40}>#</TableCell>


                            <TableCell sx={{ typography: 'subtitle2' }}>Description</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>User ID</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Date</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Previous Version</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Latest Version</TableCell>



                        </TableRow>
                    </TableHead>

                    <TableBody>



                    </TableBody>
                </Table>
            </Scrollbar>
        </TableContainer>
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
        batch_number: '',
        quantity: '',
        designer_id: '',
        created_at: '',
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
                                <RHFTextField
                                    name="batch_number"
                                    label="Batch Number"
                                    value={currentInvoice.batch_number}
                                    disabled
                                />
                                <RHFTextField
                                    name="quantity"
                                    label="Quantity"
                                    value={currentInvoice.quantity}
                                    disabled
                                />
                                <RHFTextField
                                    name="designer_id"
                                    label="Designer ID"
                                    value={currentInvoice.designer_id}
                                    disabled
                                />
                                {/* <RHFTextField
                                    name="created_at"
                                    label="Created on"
                                    value={currentInvoice.created_at?.split["T"]}
                                    disabled
                                /> */}

                            </Stack>
                        </FormProvider>
                    </Stack>
                </Box>

                {/* <br />

                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />




                {/* <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} /> */}


                {renderList}

                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />

                {/* <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                    Design Registration Part
                </Typography>

                <br />

                <FormProvider methods={methods}>
                    <Stack spacing={3}>

                        <RHFSelect
                            fullWidth
                            id="role_id"
                            name="role_id"
                            label="Status"
                            InputLabelProps={{ shrink: true }}
                            PaperPropsSx={{ textTransform: 'capitalize' }}
                        >
                            <MenuItem value="">Select Status</MenuItem>
                            {statusOptionsnew && statusOptionsnew.length > 0 && statusOptionsnew.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </RHFSelect>
                        <RHFTextField
                            name="comment"
                            placeholder="Application Number"
                        />
                        <RHFTextField name="date" label="Date" />
                        <RHFUpload
                            name="image1"
                            maxSize={3145728}
                        />

                        <Stack direction="row" sx={{ mb: 0.5 }} alignItems="center">
                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                Submit
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </FormProvider>

                <Stack direction="row" sx={{ mb: 5 }} alignItems="center">
                    {renderList}
                </Stack> */}

                {/* {renderFooter} */}
            </Card >


        </>
    );


}

InvoiceDetails.propTypes = {
    invoice: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
};
