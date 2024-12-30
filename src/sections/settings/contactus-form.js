// src/sections/settings/contact-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';
import InputAdornment from '@mui/material/InputAdornment';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';

import { useResponsive } from 'src/hooks/use-responsive';

// import {
//   _tags,
// } from 'src/_mock';

import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'src/components/snackbar';
// import FormProvider, {
//   RHFTextField,
//   // RHFAutocomplete,
// } from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';


import FormProvider, {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';

import { FetchUserDetail, ManageAPIsData } from '../../utils/commonFunction';
import { CONTACTUS_ENDPOINT } from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';

import { fData } from 'src/utils/format-number';
import { useMockedUser } from 'src/hooks/use-mocked-user';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const password = useBoolean();

  const { user } = useMockedUser();

  // const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [tableData, setTableData] = useState([]);

  const NewProductSchema = Yup.object().shape({
    address: Yup.string().required('Address is required'),
    email: Yup.string().required('Email is required'),
    contact1: Yup.string().required('Contact1 is required'),
  });

  const defaultValues = useMemo(
    () => ({
      address: tableData?.address || '',
      email: tableData?.email || '',
      contact1: tableData?.contact1 || '',
      contact2: tableData?.contact2 || '',
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
    control,
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

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    try {

      const user = await FetchUserDetail();
      data.apihitid = user.id
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();

      const apiUrl = `${CONTACTUS_ENDPOINT}?id=1`;
      const fetchMethod = "PUT";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar('Update success!');
        getListingData();
        router.push(paths.dashboard.settings.contactus);
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

  // Listing data
  const getListingData = async () => {
    try {

      const response = await ManageAPIsData(`${CONTACTUS_ENDPOINT}?id=1`, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();
      // if (typeof responseData === 'object' && responseData.data) {

      setTableData(responseData.data);
      // }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    getListingData();
  }, []);


  const renderAddressForm = (
    <>

      <Grid xs={12} md={12}>
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

            <RHFTextField name="address" label="Address" />
            <RHFTextField name="email" label="Email" />
            <RHFTextField name="contact1" label="Contact 1" />
            <RHFTextField name="contact2" label="Contact 2" />





          </Box>

        </Card>
      </Grid>

    </>
  );

  const renderActions = (
    <>
      {/* {mdUp && <Grid md={4} />} */}
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>


        <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting}>
          {'Update'}
        </LoadingButton>
      </Grid>



    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>




        {renderAddressForm}

        {renderActions}
      </Grid>
    </FormProvider>

  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
