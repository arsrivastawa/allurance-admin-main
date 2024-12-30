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
import Button from '@mui/material/Button';
import Cookies from 'js-cookie';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT, MANAGE_OFFLINE_SALES_PAYMENT_CONFIRMATION } from '../../utils/apiEndPoints';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function ProductNewEditForm2({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData,setTableData] = useState([])
  console.log(tableData,"DATA")

  const NewProductSchema = Yup.object().shape({
    payment_type: Yup.string().required('Payment Method is required'),
  });

  const defaultValues = useMemo(
    () => ({
      payment_type: tableData || '',
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues: {
      payment_type: '', // Set initially to empty
    },
  });
  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (tableData) {
      reset({ payment_type: tableData }); // Update the form's values when tableData changes
    }
  }, [tableData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      if (requestId) {
        data.request_id = requestId;
      }
      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_PAYMENT_CONFIRMATION,
        'POST',
        data
      );
      const responseData = await response.json();
      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        router.push(paths.dashboard.manage_offline_sales.step8);
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (err) {
      console.error(err.message);
      enqueueSnackbar('An error occurred while submitting data.', { variant: 'error' });
    }
  });

  const fetchRequestData = async () => {
    const payload = { request_id: Cookies.get('request_id') };
    const apiUrl = `${MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT}`;
    const fetchMethod = 'POST';
    const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, payload);
    const responseData = await response.json();

    if (responseData?.data) {
      setTableData(responseData?.data?.order_data.payment_type);
      console.log(responseData?.data?.order_data.payment_type,"ffgadf")
    } else {
      setTableData('');
    }
  };

  useEffect(() => {
    if (Cookies.get('request_id')) {
      fetchRequestData();
    }
  }, []);

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card>
              <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
                Confirmation For Payment
              </Typography>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Controller
                  name="payment_type"
                  control={methods.control}
                  defaultValue={defaultValues.payment_type}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      sx={{ mt: 2 }}
                    >
                      <FormControlLabel value="1" control={<Radio />} label="Gift Card" />
                      <FormControlLabel value="2" control={<Radio />} label="Cash" />
                      <FormControlLabel value="3" control={<Radio />} label="UPI" />
                      <FormControlLabel
                        value="4"
                        control={<Radio />}
                        label="Credit Card/Debit Card"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.payment_type && (
                  <Typography color="error" variant="body2">
                    {errors.payment_type.message}
                  </Typography>
                )}
              </Stack>

              <Grid
                xs={12}
                md={12}
                sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => router.back()}
                  sx={{ textTransform: 'capitalize' }}
                >
                  Back
                </Button>
                <LoadingButton type="submit" variant="contained" size="md" loading={isSubmitting}>
                  Submit
                </LoadingButton>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}

ProductNewEditForm2.propTypes = {
  currentProduct: PropTypes.object,
};
