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
              <TableCell sx={{ typography: 'subtitle2' }}>Order Id</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Place Order Amount</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Applied Commission</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Get Commission Amount</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Created At</TableCell>
              {/* <TableCell sx={{ typography: 'subtitle2' }}>Order Channel Mode</TableCell> */}
              <TableCell sx={{ typography: 'subtitle2' }}>Invoice Id</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentProduct?.affiliate_history?.length > 0 ? (
              currentProduct?.affiliate_history?.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.order_orde_id || '-'}</TableCell>
                  <TableCell>{row.place_order_amount || '-'}</TableCell>
                  <TableCell>{row.applied_commission || '-'}{'%'}</TableCell>
                  <TableCell>{row.get_commission_amount || '-'}</TableCell>
                  <TableCell>
                    {row.created_at ? format(new Date(row.created_at), 'dd MMM yyyy') : '-'}
                  </TableCell>
                  {/* <TableCell>{row.order_channel_mode  === 1 ? 'Online' : row.order_channel_mode  === 2 ? 'Offline' :  '-'}</TableCell> */}
                  <TableCell>{row.order_invoice_id || '-'}</TableCell>
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
  {/* Widgets Section */}
  {/* <Grid item xs={12} md={12} sx={{ p: 3 }}>  */}
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <AppWidgetSummary
          title="Total Orders"
          total={currentProduct?.total_orders ||'--'}
          chart={{
            series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <AppWidgetSummary
          title="Total Revenue"
          total={currentProduct?.total_revenu ||'--'}
          chart={{
            colors: [theme.palette.info.light, theme.palette.info.main],
            series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
          }}
        />
      </Grid>
    {/* </Grid> */}
  </Grid>
      <Box sx={{ p: 3 }}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Affiliate History:-</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              <strong>Name:</strong> {currentProduct?.name || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Url:</strong> {currentProduct?.url || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Total Orders:</strong> {currentProduct?.total_orders || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Total Revenue:</strong> {currentProduct?.total_revenu || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Created At:</strong>  {currentProduct?.created_at ? format(new Date(currentProduct.created_at), 'dd MMM yyyy') : '-'}
            </Typography>
            {renderList}
            <Divider sx={{ my: 2 }} />
          </Card>
        </Grid>
      </Box>
    </>
  );
}
