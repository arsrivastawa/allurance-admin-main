import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Cookies from 'js-cookie';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  MANAGE_OFFLINE_SALES_ADD_NEW_USER,
  MANAGE_OFFLINE_SALES_CHECK_USER,
  MANAGE_OFFLINE_SALES_SUBMIT_SELECTED_CHANNEL,
} from '../../utils/apiEndPoints';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function ProductNewEditForm2({ currentProduct }) {
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [openModal, setOpenModal] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Validation schema for the main form
  const NewProductSchema = Yup.object().shape({
    phone_number: Yup.string().required('Phone number is required'),
  });

  const defaultValues = useMemo(
    () => ({
      phone_number: currentProduct?.phone_number || '',
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

  // Validation schema for dialog form
  const DialogFormSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
  });

  const dialogMethods = useForm({
    resolver: yupResolver(DialogFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  const {
    handleSubmit: handleDialogSubmit,
    reset: resetDialogForm,
    formState: { isSubmitting: isDialogSubmitting },
  } = dialogMethods;

  const onDialogSubmit = handleDialogSubmit(async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      if (requestId) {
        data.request_id = requestId;
      }
      const response = await ManageAPIsDataWithHeader(
        MANAGE_OFFLINE_SALES_ADD_NEW_USER,
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
      } else {
        enqueueSnackbar(responseData.error || 'Error adding user details', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting user details:', error);
      enqueueSnackbar('Failed to add user details', { variant: 'error' });
    }
  });

  const onSubmit = async (data) => {
    try {
      const requestId = Cookies.get('request_id');
      if (requestId) {
        data.request_id = requestId;
      }

      const response = await ManageAPIsDataWithHeader( MANAGE_OFFLINE_SALES_CHECK_USER,'POST', data);

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        router.push(paths.dashboard.manage_offline_sales.step3);
      } else {
        enqueueSnackbar(responseData.message || 'Error submitting data', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      enqueueSnackbar('Failed to submit data', { variant: 'error' });
    }
  };

   const fetchRequestID = async() => {
    const apiUrl = `${MANAGE_OFFLINE_SALES_SUBMIT_SELECTED_CHANNEL}`;
      const fetchMethod = 'POST';
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod);
      const responseData = await response.json();
      console.log(responseData,"DATA")

      if (responseData.status) {
        const requestId = responseData.data[0].request_id;
        if (requestId) {
          Cookies.set('request_id', requestId, { expires: 1 }); 
          enqueueSnackbar(responseData.message, { variant: 'success' });
        }
      } 
}

useEffect(() => {
  fetchRequestID()
},[])

  return (
    <>
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Grid container justifyContent="flex-end" sx={{ p: 2, mb: 1 }}>
            <Button
              variant="contained"
              onClick={handleOpenModal}
              sx={{ textTransform: 'capitalize' }}
            >
              + Add New User
            </Button>
          </Grid>
          <Card>
            <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
              Registration
            </Typography>
            <Stack spacing={3} sx={{ p: 3 }}>
              <RHFTextField type="text" name="phone_number" label="Enter mobile no/customer ID" />
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
                Submit & Next
              </LoadingButton>
            </Grid>
            {/* {userData && (
        <Card sx={{ mt: 3 }}>
          <Typography variant="h5" sx={{ p: 2 }}>
            User Details
          </Typography>
          <Stack spacing={2} sx={{ p: 2 }}>
            {userData.map((user) => (
              <Stack key={user.id} spacing={1}>
                <Typography variant="subtitle1">
                  <strong>Name:</strong> {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Phone:</strong> {user.phone}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Prefix ID:</strong> {user.prefix_id}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      )} */}
          </Card>
        </Grid>
        </Grid>
    </FormProvider>
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>Add New User Details</DialogTitle>
          <FormProvider methods={dialogMethods} onSubmit={onDialogSubmit}>
            <DialogContent>
              <Stack spacing={3}>
                <RHFTextField name="first_name" label="First Name" />
                <RHFTextField name="last_name" label="Last Name" />
                <RHFTextField name="email" label="Email" />
                <RHFTextField name="phone" label="Phone Number" />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} variant="outlined">
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isDialogSubmitting}>
                Save & Next
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
