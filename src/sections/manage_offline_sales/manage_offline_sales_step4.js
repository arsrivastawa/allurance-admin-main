// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete, RHFUpload } from 'src/components/hook-form';
import { FetchUserDetail, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  CATEGORY_ENDPOINT,
  MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT,
  MANAGE_OFFLINE_SALES_SUBMIT_SELECTED_CHANNEL,
  MANAGE_OFFLINE_SALES_UPDATE_ORDER_TYPE,
} from '../../utils/apiEndPoints';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { Button, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import Cookies from 'js-cookie';

// ----------------------------------------------------------------------

export default function ProductNewEditForm2({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTabledata] = useState([]);
  console.log(tableData, 'TABLEDATA');

  const NewProductSchema = Yup.object().shape({
    order_type: Yup.string().required('Order Type is required'),
  });

  const defaultValues = useMemo(
    () => ({
      order_type: tableData || '',
    }),
    [tableData]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (tableData) {
      reset(defaultValues);
    }
  }, [tableData, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      console.log(requestId, 'ID');
      if (requestId) {
        data.request_id = requestId;
      }

      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_UPDATE_ORDER_TYPE,
        'POST',
        data
      );

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        router.push(paths.dashboard.manage_offline_sales.step5);
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  const fetchRequestData = async () => {
    const payload = { request_id: Cookies.get('request_id') };
    const apiUrl = `${MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT}`;
    const fetchMethod = 'POST';
    const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, payload);
    const responseData = await response.json();

    if (responseData?.data) {
      setTabledata(responseData?.data?.order_data.order_type);
      console.log(responseData?.data?.order_data.order_type, 'DATAasfsafsafs');
    } else {
      setTabledata('');
    }
  };

  useEffect(() => {
    if (Cookies.get('request_id')) {
      fetchRequestData();
    }
  }, []);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}
          <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
            Types Of Order
          </Typography>
          <Stack spacing={3} sx={{ p: 3 }}>
            <RadioGroup
              value={values.order_type}
              onChange={(event) => {
                setValue('order_type', event.target.value);
                methods.trigger('order_type');
              }}
              sx={{ mt: 2 }}
              name="order_type"
            >
              <FormControlLabel value={1} control={<Radio />} label="Deliver Now" />
              <FormControlLabel value={2} control={<Radio />} label="Deliver At Home" />
            </RadioGroup>
            {methods.formState.errors.order_type && (
              <span style={{ color: 'red', fontSize: '0.875rem' }}>
                {methods.formState.errors.order_type.message}
              </span>
            )}
          </Stack>
          <Grid xs={12} md={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.back()}
              sx={{ textTransform: 'capitalize' }}
            >
              Back
            </Button>
            <LoadingButton type="submit" variant="contained" size="md" loading={isSubmitting}>
              Submit & Next
            </LoadingButton>
          </Grid>
        </Card>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm2.propTypes = {
  currentProduct: PropTypes.object,
};
