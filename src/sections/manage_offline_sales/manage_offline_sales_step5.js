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
import { ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  MANAGE_OFFLINE_SALES_ADD_SERIAL_DATA,
  MANAGE_OFFLINE_SALES_FETCH_ALL_PRODUCT,
  MANAGE_OFFLINE_SALES_GET_SERIAL_NO_BASED_ON_PRODUCT,
  MANAGE_OFFLINE_SALES_LIST_OF_SERIAL_NUMBER,
  MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT,
  MANAGE_OFFLINE_SALES_REMOVE_SERIAL_NUMBER,
} from '../../utils/apiEndPoints';
import { paths } from 'src/routes/paths';
import {
  CardContent,
  CardMedia,
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
  const [productData, setProductData] = useState([]);
  const [orderType, setOrderType] = useState(null);

  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);

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

  useEffect(() => {
    const total = tableData.reduce(
      (acc, row) => acc + parseFloat(row.product_discount_price || 0),
      0
    );
    setTotalDiscountPrice(total);
  }, [tableData]);

  const handleRemoveRow = async (serial_number) => {
    console.log(serial_number, 'ID');
    try {
      const payload = {
        request_id: Cookies.get('request_id'),
        serial_number: serial_number,
      };

      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_REMOVE_SERIAL_NUMBER,
        'POST',
        payload
      );

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        setTableData((prevData) => prevData.filter((row) => row?.serial_number !== serial_number));
        enqueueSnackbar('Row removed successfully', { variant: 'info' });
        getAddressListingData();
      } else {
        enqueueSnackbar(responseData.message || 'Error deleting data', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      enqueueSnackbar('Error deleting data', { variant: 'error' });
    }
  };

  const fetchAllProductData = async () => {
    try {
      const payload = { request_id: Cookies.get('request_id') };
      const apiUrl = MANAGE_OFFLINE_SALES_FETCH_ALL_PRODUCT;
      const response = await ManageAPIsDataWithHeader(apiUrl, 'POST', payload);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();
      if (responseData.data.length) {
        setProductData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAddressListingData = async () => {
    try {
      const payload = { request_id: Cookies.get('request_id') };
      const apiUrl = MANAGE_OFFLINE_SALES_LIST_OF_SERIAL_NUMBER;
      const response = await ManageAPIsDataWithHeader(apiUrl, 'POST', payload);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();
      if (responseData.data.length) {
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getDetailsAfterPayment = async () => {
    try {
      const payload = { request_id: Cookies.get('request_id') };
      const apiUrl = MANAGE_OFFLINE_SALES_ORDER_DETAILS_AFTER_PAYMENT;
      const response = await ManageAPIsDataWithHeader(apiUrl, 'POST', payload);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();
      if (responseData.data) {
        const orderData = responseData.data.order_data;
        setOrderType(orderData.order_type);
        if (responseData.data.data.length) {
          setTableData(responseData.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const requestId = Cookies.get('request_id');
    if (requestId) {
      getAddressListingData();
      fetchAllProductData();
      getDetailsAfterPayment();
    } else {
      console.warn('Request ID cookie is not available');
    }
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      if (requestId) {
        data.request_id = requestId;
      }

      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_ADD_SERIAL_DATA,
        'POST',
        data
      );

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        getAddressListingData();
        const newData = responseData.data.filter(
          (newRow) => !tableData.some((existingRow) => existingRow.id === newRow.id)
        );
        reset();
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  const handleNext = () => {
    router.push(paths.dashboard.manage_offline_sales.step6);
  };

  const handleAddtoCart = async (productId) => {
    try {
      const payload = {
        request_id: Cookies.get('request_id'),
        product_id: productId,
      };
      const apiUrl = MANAGE_OFFLINE_SALES_GET_SERIAL_NO_BASED_ON_PRODUCT;
      const response = await ManageAPIsDataWithHeader(apiUrl, 'POST', payload);

      const responseData = await response.json();
      if (responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        getAddressListingData();
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const requestId = Cookies.get('request_id');
    if (requestId) {
      getAddressListingData();
      fetchAllProductData();
    } else {
      console.warn('Request ID cookie is not available');
    }
  }, []);

  const cardsData = productData.map((product) => ({
    id: product.id,
    image: product.images[0]?.url || product.images[1]?.url || 'https://via.placeholder.com/150',
    title: product.name,
  }));
  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card>
              <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
                Products
              </Typography>

              {orderType === 2 ? (
                <Grid container spacing={3} sx={{ mb: 1, ml: 1, mt: 2 }}>
                  {cardsData.map((card) => (
                    <Grid item xs={12} sm={6} md={2} key={card.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={card.image}
                          alt={card.title}
                        />
                        <CardContent>
                          <Typography variant="p" component="div">
                            {card.title}
                          </Typography>
                          <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3 }}
                            type="submit"
                            onClick={() => handleAddtoCart(card.id)}
                          >
                            Add
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack spacing={3} sx={{ p: 3, mt: 3 }}>
                  <RHFTextField type="text" name="serial_number" label="Enter Serial No." />
                  <LoadingButton type="submit" variant="contained" size="md" loading={isSubmitting}>
                    Submit
                  </LoadingButton>
                </Stack>
              )}

              {tableData.length > 0 && (
                <Grid xs={12} md={12}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Category Name</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Discount Price</TableCell>
                          <TableCell>Batch Number</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.serial_number}</TableCell>
                            <TableCell>{row.product_name}</TableCell>
                            <TableCell>{row.category_name}</TableCell>
                            <TableCell>{row.product_price}</TableCell>
                            <TableCell>{row.product_discount_price}</TableCell>
                            <TableCell>{row.batch_number}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemoveRow(row.serial_number)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="h6" sx={{ p: 3 }}>
                    Total Discount Price: {totalDiscountPrice.toFixed(2)}
                  </Typography>
                </Grid>
              )}
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <Grid xs={12} md={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.back()}
          sx={{ textTransform: 'capitalize' }}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="contained"
          size="md"
          onClick={handleNext}
          disabled={tableData.length === 0}
        >
          Next
        </Button>
      </Grid>
    </>
  );
}

ProductNewEditForm2.propTypes = {
  currentProduct: PropTypes.object,
};
