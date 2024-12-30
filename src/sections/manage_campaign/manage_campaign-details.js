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
import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  AFFILIATE_ENDPOINT,
  MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT,
} from '../../utils/apiEndPoints';
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
import { Box, useTheme } from '@mui/system';
import { formatDate } from '@fullcalendar/core';
import { fDateTime } from 'src/utils/format-time';
import { format } from 'date-fns';
import AppWidgetSummary from '../overview/app/app-widget-summary';

export default function InvoiceDetails({ currentProduct }) {
  const theme = useTheme();
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

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 3 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ typography: 'subtitle2' }}>S.No</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Coupan Code</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Coupan Status</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>User Name</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Applied Date</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentProduct?.coupons?.length > 0 ? (
              currentProduct?.coupons?.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.coupon_code || '-'}</TableCell>
                  <TableCell>
                    {row.coupon_status === 1 ? 'Unused' : row.coupon_status === 2 ? 'Used' : '-'}
                  </TableCell>
                  <TableCell>
                    {row.user_first_name || '-'} {row.user_last_name || '-'}
                  </TableCell>
                  <TableCell>
                    {row.updated_at ? format(new Date(row.updated_at), 'dd MMM yyyy') : '-'}
                  </TableCell>
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
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Campaign History:-</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              <strong>Campaign Name:</strong> {currentProduct?.name || '--'}
            </Typography>
            <Typography variant="body1">
              <strong>Number of valid redemption:</strong>{' '}
              {currentProduct?.no_of_valid_redemptions || '--'}
            </Typography>
            <Typography variant="body1">
              <strong>Minimum Cart Value:</strong> {currentProduct?.min_cart_value || '--'}
            </Typography>
            <Typography variant="body1">
              <strong>Channel Mode:</strong>{' '}
              {currentProduct?.channel_mode === 1
                ? 'Online'
                : currentProduct?.channel_mode === 2
                  ? 'Offline'
                  : currentProduct?.channel_mode === 3
                    ? 'Both'
                    : '--'}
            </Typography>
            <Typography variant="body1">
              <strong>Record status:</strong>{' '}
              {currentProduct?.record_status === 1
                ? 'Pending'
                : currentProduct?.record_status === 2
                  ? 'Approved'
                  : currentProduct?.record_status === 3
                    ? 'Rejected'
                    : '--'}
            </Typography>
            <Typography variant="body1">
              <strong>Category Name:</strong> {currentProduct?.categoryNameResults || '--'}
            </Typography>
            <Typography variant="body1">
              <strong>Created At:</strong>{' '}
              {currentProduct?.created_at
                ? format(new Date(currentProduct.created_at), 'dd MMM yyyy')
                : '--'}
            </Typography>
            {renderList}
            <Divider sx={{ my: 2 }} />
          </Card>
        </Grid>
      </Box>
    </>
  );
}
