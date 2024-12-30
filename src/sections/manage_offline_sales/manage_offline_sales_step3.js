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
  MANAGE_OFFLINE_SALES_ADD_NEW_ADDRESS,
  MANAGE_OFFLINE_SALES_ALL_ADDRESS_LIST,
  MANAGE_OFFLINE_SALES_DELETE_ADDRESS,
  MANAGE_OFFLINE_SALES_UPDATE_ADDRESS,
} from '../../utils/apiEndPoints';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import Cookies from 'js-cookie';
import DeleteIcon from '@mui/icons-material/Delete';

// ----------------------------------------------------------------------

export default function ProductNewEditForm2({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [deliveryOption, setDeliveryOption] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const NewProductSchema = Yup.object().shape({
    address_id: Yup.string().required('Address is required'),
  });

  const defaultValues = useMemo(
    () => ({
      address_id: currentProduct?.address_id || '',
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
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const DialogFormSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    address_1: Yup.string().required('Address is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    landmark: Yup.string().required('Landmark is required'),
    pincode: Yup.string().required('Pincode is required'),
  });

  const dialogMethods = useForm({
    resolver: yupResolver(DialogFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_1: '',
      country: '',
      state: '',
      district: '',
      landmark: '',
      pincode: '',
    },
  });

  const {
    handleSubmit: handleDialogSubmit,
    reset: resetDialogForm,
    formState: { isSubmitting: isDialogSubmitting },
  } = dialogMethods;

  const handleDeliveryChange = (event) => {
    setDeliveryOption(event.target.value);
    setValue('address_id', event.target.value);
    methods.trigger('address_id');
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      if (requestId) {
        data.request_id = requestId;
      }
      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_UPDATE_ADDRESS,
        'POST',
        data
      );
      const responseData = await response.json();

      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        router.push(paths.dashboard.manage_offline_sales.step4);
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  const getAddressListingData = async () => {
    try {
      const payload = { request_id: Cookies.get('request_id') };
      const apiUrl = MANAGE_OFFLINE_SALES_ALL_ADDRESS_LIST;
      const response = await ManageAPIsDataWithHeader(apiUrl, 'POST', payload);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();
      console.log(responseData, 'RESPONSEDATA');

      if (responseData.data.length) {
        setAddressList(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const requestId = Cookies.get('request_id');
    if (requestId) {
      getAddressListingData();
    } else {
      console.warn('Request ID cookie is not available');
    }
  }, []);

  const onDialogSubmit = handleDialogSubmit(async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      if (requestId) {
        data.request_id = requestId;
      }
      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_ADD_NEW_ADDRESS,
        'POST',
        data
      );

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        router.push(paths.dashboard.manage_offline_sales.step3);
        // setUserData(responseData.data.user_data);
        resetDialogForm();
        handleCloseModal();
        getAddressListingData();
      } else {
        enqueueSnackbar(responseData.error || 'Error adding user details', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting user details:', error);
      enqueueSnackbar('Failed to add user details', { variant: 'error' });
    }
  });

  const handleDeleteAddress = async (addressId) => {
    try {
      const requestId = Cookies.get('request_id');
      if (!requestId) {
        enqueueSnackbar('Request ID not found.', { variant: 'error' });
        return;
      }
      const payload = {
        request_id: requestId,
        address_id: addressId,
      };
      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_DELETE_ADDRESS,
        'POST',
        payload 
      );
  
      const responseData = await response.json();
  
      if (response.ok && responseData.status) {
        enqueueSnackbar('Address deleted successfully', { variant: 'success' });
        setAddressList(prevList => prevList.filter(address => address.id !== addressId));
      } else {
        enqueueSnackbar(responseData.message || 'Error deleting address', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      enqueueSnackbar('Error deleting address', { variant: 'error' });
    }
  };
  

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Grid container justifyContent="flex-end" sx={{ p: 2, mb: 1 }}>
          <Button variant="contained" onClick={handleOpenModal} sx={{ textTransform: 'capitalize' }}>
            + Add New Address
          </Button>
        </Grid>
        <Card>
          <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
            Billing Information
          </Typography>
          <Stack spacing={3} sx={{ p: 3 }}>
            {addressList.length > 0 ? (
              <RadioGroup value={deliveryOption} onChange={handleDeliveryChange} sx={{ mt: 2 }} name="address_id">
                {addressList.map((address) => (
                  <FormControlLabel
                  key={address.id}
                  value={address.id}
                  control={<Radio />}
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        p: 2,
                        borderRadius: 1,
                        boxShadow: 1,
                        backgroundColor: 'background.paper',
                        position: 'relative',  
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Name: {`${address.first_name} ${address.last_name}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Address: {`${address.address_1}, ${address.landmark}, ${address.district}, ${address.state} - ${address.pincode}`}
                      </Typography>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation(); 
                          handleDeleteAddress(address.id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 15,
                          right: 4,
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                />
                
                ))}
              </RadioGroup>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No address found, please add a new address.
              </Typography>
            )}
            {methods.formState.errors.address_id && (
              <Typography variant="body2" color="error">
                {methods.formState.errors.address_id.message}
              </Typography>
            )}
          </Stack>
  
          <Grid xs={12} md={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => router.back()} sx={{ textTransform: 'capitalize' }}>
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
    <>    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
      </Grid>
    </FormProvider>
    <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
    <DialogTitle>Add New Address</DialogTitle>
    <FormProvider methods={dialogMethods} onSubmit={onDialogSubmit}>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="first_name" label="First Name" />
            <RHFTextField name="last_name" label="Last Name" />
            <RHFTextField name="email" label="Email" />
            <RHFTextField name="phone" label="Phone no" />
            <RHFTextField name="address_1" label="Address" />
            <RHFTextField name="country" label="Country" />
            <RHFTextField name="state" label="State" />
            <RHFTextField name="district" label="District" />
            <RHFTextField name="landmark" label="landmark" />
            <RHFTextField name="pincode" label="Pincode" type="number" />
          </Box>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal} variant="outlined">
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isDialogSubmitting}>
          Create Address
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  </Dialog>
  </>

  );
}

ProductNewEditForm2.propTypes = {
  currentProduct: PropTypes.object,
};
