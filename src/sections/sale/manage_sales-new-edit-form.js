// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';

import { ManageAPIsData } from '../../utils/commonFunction';
import { GIFT_CARD_ENDPOINT } from '../../utils/apiEndPoints';
import { Button } from '@mui/material';

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [UserData, setUserData] = useState();
  const NewProductSchema = Yup.object().shape({
    number: Yup.string().required('Mobile number is required'),
  });

  const defaultValues = useMemo(
    () => ({
      number: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);


  const onSubmit = handleSubmit(async (data) => {

    setUserData(data.number)
    // try {
    //   const response = await fetchUserDetails(data.number); // You need to implement this function
    //   if (response.ok) {
    //     const userData = await response.json();
    //     setUserData(userData);
    //   } else {
    //     const errorData = await response.json();
    //     enqueueSnackbar(errorData.error, { variant: 'error' });
    //   }
    // } catch (err) {
    //   console.error(err.message);
    // }
  });

  const handleRedirect = () => {
    router.push(paths.dashboard.branch_sell.product);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="User Details" />
            <Stack spacing={3} sx={{ p: 3 }}>
              <RHFTextField id="number" name="number" label="Mobile Number" />
              <Grid container item xs={12} justifyContent="center">
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                >
                  Search user
                </LoadingButton>
              </Grid>
              <Stack spacing={2}>
                {UserData && (
                  <>
                    <RHFTextField
                      id="name"
                      name="name"
                      label="Name"
                    // defaultValue={userData.name}
                    />
                    <RHFTextField
                      id="address"
                      name="address"
                      label="Address"
                    // defaultValue={userData.address}
                    />
                    <RHFTextField
                      id="userId"
                      name="userId"
                      label="User ID"
                    // defaultValue={userData.userId}
                    />
                  </>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Button
            variant="contained"
            size="large"
            onClick={handleRedirect}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};