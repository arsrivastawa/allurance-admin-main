import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { REPLICATOR_ENDPOINT } from '../../utils/apiEndPoints';
import Box from '@mui/material/Box';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { useMemo } from 'react';
import { jwtDecode } from 'src/auth/context/jwt/utils';


export default function ProductNewEditForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const NewProductSchema = Yup.object().shape({
    designer_id: Yup.string().required('Model number is required'),
    quantity: Yup.number().required('Quantity is required').positive('Quantity must be a positive number').integer('Quantity must be an integer'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const fetchMethod = 'POST';
    const STORAGE_KEY = 'accessToken';
    let accessToken;
    if (typeof sessionStorage !== 'undefined') {
      accessToken = sessionStorage.getItem(STORAGE_KEY);
    } else {
      console.error("sessionStorage is not available in this environment.");
    }


    let decoded;
    if (accessToken != null && accessToken !== undefined) {
      decoded = jwtDecode(accessToken);
    } else {
      console.error("accessToken is undefined. Cannot decode.");
    }
    try {
      const payload = {
        designer_id: data.designer_id,
        quantity: data.quantity,
        created_by: decoded.data.id

      };
      payload.headers = { Authorization: `Bearer ${accessToken}` }
      const response = await ManageAPIsDataWithHeader(REPLICATOR_ENDPOINT, fetchMethod, payload);
      if (response.ok) {
        enqueueSnackbar('Replication success!');
        router.push(paths.dashboard.replicate.root);
        // window.location.reload();
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
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

              <RHFTextField name="designer_id" label="Model number" type="text" />
              <RHFTextField name="quantity" label="Quantity" type="number" />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting}>
            Submit
          </LoadingButton>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  id: PropTypes.string.isRequired,
};
