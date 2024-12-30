import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
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
import { HandleImageError, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  MANAGE_OFFLINE_SALES_PRODUCT_PREVIEW,
} from '../../utils/apiEndPoints';
import { paths } from 'src/routes/paths';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';

// ----------------------------------------------------------------------

export default function ProductNewEditForm2({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTableData] = useState([]);
  console.log(tableData, 'DATA');

  const NewProductSchema = Yup.object().shape({
    serial_number: Yup.string().required('Serial Number is required'),
  });

  const defaultValues = useMemo(
    () => ({
      serial_number: currentProduct?.serial_number || '',
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
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const ProductPreviewData = async (data) => {
    try {
      const payload = { request_id: Cookies.get('request_id') };

      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_PRODUCT_PREVIEW,
        'POST',
        payload
      );

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        setTableData(responseData.data);
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const requestId = Cookies.get('request_id');
    if (requestId) {
      ProductPreviewData();
    } else {
      console.warn('Request ID cookie is not available');
    }
  }, []);

  const handleNext = () => {
    router.push(paths.dashboard.manage_offline_sales.step7);
  };

  return (
    <>
      <FormProvider>
        <Grid container spacing={3}>
          <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
            Products Preview
          </Typography>
          {tableData.length > 0 &&
            tableData.map((product, index) => (
              <Grid item xs={12} md={12} key={product.id}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {product.product_name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <img
                        src={product.images[0]?.url || 'https://placehold.co/500x500'}
                        alt={product.product_name}
                        style={{ width: '30%' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">Category: {product.category_name}</Typography>
                      <Typography variant="body2">Model Number: {product.model_number}</Typography>
                      <Typography variant="body2">
                        Serial Number: {product.serial_number}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1">Price: {product.product_price}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
        </Grid>

        <Grid
          container
          spacing={3}
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
          <Button type="button" variant="contained" size="md" onClick={handleNext}>
            Next
          </Button>
        </Grid>
      </FormProvider>
    </>
  );
}

ProductNewEditForm2.propTypes = {
  currentProduct: PropTypes.object,
};
