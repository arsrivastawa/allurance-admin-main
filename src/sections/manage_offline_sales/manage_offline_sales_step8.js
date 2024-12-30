import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Cookies from 'js-cookie';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT } from '../../utils/apiEndPoints';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { paths } from 'src/routes/paths';
import Scrollbar from 'src/components/scrollbar';
import { Box } from '@mui/system';
import { formatDate } from '@fullcalendar/core';

// ----------------------------------------------------------------------

export default function ProductNewEditForm2({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTableData] = useState([]);
  console.log(tableData, 'DATA');

  const NewProductSchema = Yup.object().shape({
    payment_type: Yup.string().required('Payment Method is required'),
  });

  const defaultValues = useMemo(
    () => ({
      payment_type: currentProduct?.payment_type || '',
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const fetchOrderDetails = async (data) => {
    try {
      const payload = { request_id: Cookies.get('request_id') };
      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT,
        'POST',
        payload
      );
      const responseData = await response.json();
      if (response.ok && responseData.status) {
        setTableData(responseData?.data);
        enqueueSnackbar(responseData.message, { variant: 'success' });
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (err) {
      console.error(err.message);
      enqueueSnackbar('An error occurred while submitting data.', { variant: 'error' });
    }
  };

  useEffect(() => {
    const requestId = Cookies.get('request_id');
    if (requestId) {
      fetchOrderDetails();
    } else {
      console.warn('Request ID cookie is not available');
    }
  }, []);

  const handleClick = () => {
    router.push(paths.dashboard.manage_offline_sales.root);
    Cookies.remove('request_id');
  };

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 3 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ typography: 'subtitle2' }}>S.No</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Product Name</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Category Name</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Batch Number</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Model Number</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Serial Number</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Order Place Status</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Product Discount Price</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableData?.product_data?.length > 0 ? (
              tableData?.product_data?.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.product_name || '-'}</TableCell>
                  <TableCell>{row.category_name || '-'}</TableCell>
                  <TableCell>{row.batch_number || '-'}</TableCell>
                  <TableCell>{row.model_number || '-'}</TableCell>
                  <TableCell>{row.serial_number || '-'}</TableCell>
                  <TableCell>{row.order_place_status || '-'}</TableCell>
                  <TableCell>{row.product_discount_price || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" align="center">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">User Info</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Prefix Id:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{tableData?.user_data?.prefix_id || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Customer Id:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {tableData?.user_data?.customer_id || '--'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Name:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {`${tableData?.user_data?.first_name || ''} ${tableData?.user_data?.last_name || ''}`.trim() ||
                      '--'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Email:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{tableData?.user_data?.email || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Phone:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{tableData?.user_data?.phone || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Address:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {tableData?.address_data
                      ? `${tableData.address_data.address_1 || ''}, ${tableData.address_data.district || ''}, ${tableData.address_data.state || ''}, ${tableData.address_data.country || ''} - ${tableData.address_data.pincode || ''}`
                          .replace(/,\s*(,|$)/g, '$1')
                          .trim()
                      : '--'}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Order Details</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Order Id:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{tableData?.order_data?.order_id || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Invoice Id:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {tableData?.order_data?.invoice_id || '--'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Total Amount:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {tableData?.order_data?.total_amount || '--'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Tax Amount:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {tableData?.order_data?.tax_amount || '--'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Invoice Date:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {formatDate(tableData?.order_data?.invoice_date || '--')}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Payment Details</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Payment Id:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {tableData?.order_data?.payment_id || '--'}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Transaction Status:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{tableData?.transaction_status || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Transaction Time:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {formatDate(tableData?.transaction_time || '--')}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Payment Bt Customer:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">
                    {tableData?.order_data?.payment_by_customer || '--'}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">PRODUCT DETAILS:-</Typography>
              <Divider sx={{ my: 2 }} />
              {renderList}
              <Divider sx={{ my: 2 }} />
              <FormProvider>
                <Grid item xs={12} md={12} sx={{ mt: 3 }}>
                  <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                    <LoadingButton
                      type="button"
                      variant="contained"
                      loading={isSubmitting}
                      onClick={handleClick}
                    >
                      {'Close'}
                    </LoadingButton>
                  </Stack>
                </Grid>
              </FormProvider>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

ProductNewEditForm2.propTypes = {
  currentProduct: PropTypes.object,
};
