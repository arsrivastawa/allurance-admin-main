// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import "../../../../public/uploadcss/index.css"
// import FormControlLabel from '@mui/material/FormControlLabel';
import Papa from 'papaparse';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

// import {
//   _tags,
// } from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import { ManageAPIsData, ManageAPIsDataWithHeader, FetchUserDetail } from '../../../utils/commonFunction';
import { GIFT_CARD_ENDPOINT } from '../../../utils/apiEndPoints';
import { Button, CardContent, Typography } from '@mui/material';
import { GridDeleteIcon } from '@mui/x-data-grid';
import { Box } from '@mui/system';
import Upload from 'src/components/upload/upload';
import Label from 'src/components/label';
import UploadCsv from 'src/components/upload/upload-csv';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [rows, setRows] = useState([{ id: 0, value: 'default value', multiplication: 'default multiplication' }]);
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    // company_name: Yup.string().required('Company name is required'),
    email: Yup.string().required('E-mail is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      company_name: currentProduct?.company_name || '',
      email: currentProduct?.email || '',
      total_amount: currentProduct?.total_amount || '',
      description: currentProduct?.description || '',
    }),
    [currentProduct]
  );

  const pairs = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    // watch,
    // setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);
  // const [error, setError] = useState("");

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    try {
      const user = await FetchUserDetail();
      console.log('calling here');
      const payload = {
        type: 3,
        name: data.name,
        company_name: data.company_name,
        email: data.email,
        amount: data.total_amount,
        description: data.description,
        apihitid: user.id,
      };
      const apiUrl = currentProduct ? `${GIFT_CARD_ENDPOINT}?id=${currentProduct.id}` : GIFT_CARD_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      payload.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, payload);
      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.single_gift_card.root);
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

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField id="name" name="name" label="Name" />
            <RHFTextField id="company_name" name="company_name" label="Company name" />
            <RHFTextField id="email" name="email" label="E-mail" />
            <RHFTextField id="total_amount" name="total_amount" label="Amount" />
            <RHFTextField id="description" name="description" label="Notes" />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {/* {mdUp && <Grid md={4} />} */}
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}
      
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
      {/* <div className="error">
        {error && <span className="error_message">{error}</span>}
      </div> */}
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>

  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
