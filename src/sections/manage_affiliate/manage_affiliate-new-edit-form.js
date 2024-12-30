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

import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete, RHFSelect } from 'src/components/hook-form';

import {
  FetchUserDetail,
  ManageAPIsData,
  ManageAPIsDataWithHeader,
  createImageOption,
  createImageOptions,
} from '../../utils/commonFunction';
import {
  AFFILIATE_ENDPOINT,
  AFFILIATE_USER_ENDPOINT,
  CATEGORY_ENDPOINT,
} from '../../utils/apiEndPoints';
import { Button, MenuItem } from '@mui/material';
import { paths } from 'src/routes/paths';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  console.log(tableData, 'DATA');

  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [couponCode, setCouponCode] = useState('');

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Title is required'),
    // url: Yup.string().required('Url is required'),
    commission1: Yup.string().required('Pair is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      url: currentProduct?.url || '',
      user_id: currentProduct?.user_id || '',
      commission1: currentProduct?.commission1 || '',
      commission2: currentProduct?.commission2 || '',
      commission3: currentProduct?.commission3 || '',
    }),
    [currentProduct]
  );

  
  useEffect(() => {
    currentProduct?.url ? setCouponCode(currentProduct?.url) : '';'';
    // Check if currentProduct exists


    // generateRandomCode();
  }, [currentProduct]);

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 15;
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    setCouponCode(code);
  };

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.url = couponCode
      const apiUrl = currentProduct
        ? `${AFFILIATE_ENDPOINT}?id=${currentProduct.id}`
        : AFFILIATE_ENDPOINT;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.manage_affiliate.root);
      } else {
        const responseData = await response.json();
        console.error('Error from server:', responseData.error);
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  const getListingDataUser = async () => {
    try {
      const fetchMethod = 'POST';

      const response = await ManageAPIsDataWithHeader(AFFILIATE_USER_ENDPOINT, fetchMethod);

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

  useEffect(() => {
    getListingDataUser();
  }, []);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFSelect
              fullWidth
              id="user_id"
              name="user_id"
              label="User Name"
              // InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select User</MenuItem>
              {tableData &&
                tableData.length > 0 &&
                tableData.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.first_name} {option.last_name}
                  </MenuItem>
                ))}
            </RHFSelect>
            <RHFTextField id="name" name="name" label="Title" />
            {/* <RHFTextField id="url" name="url" label="URL" /> */}
            <Grid container spacing={1}>
  <Grid item xs={10}>
    <RHFTextField
      id="url"
      name="url"
      label="URL"
      type="text"
      value={couponCode}
      onChange={(e) => {
        const newValue = e.target.value.toUpperCase();
        setCouponCode(newValue);
        setValue('url', newValue); // Sync with RHF
      }}
      fullWidth
      inputProps={{ maxLength: 15 }}
    />
  </Grid>
  <Grid item xs={2} alignItems="flex-end" spacing={1}>
    <Button
      style={{ padding: '12px', textAlign: 'center' }}
      variant="contained"
      onClick={() => {
        generateRandomCode();
        setValue('url', couponCode); // Ensure RHF has the updated value
      }}
    >
      Generate
    </Button>
  </Grid>
</Grid>

            <RHFTextField
              id="commission1"
              name="commission1"
              label="Commission1 (Amount range between 0 to 10K)"
              type="number"
              placeholder="Value can consider in Percentage(%) Based"
            />

            <RHFTextField
              id="commission2"
              name="commission2"
              label="Commission1 (Amount range between 10K to 20K)"
              type="number"
              placeholder="Value can consider in Percentage(%) Based"
            />
            <RHFTextField
              id="commission3"
              name="commission3"
              label="Commission1 (Amount range is 20K+)"
              type="number"
              placeholder="Value can consider in Percentage(%) Based"
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
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
