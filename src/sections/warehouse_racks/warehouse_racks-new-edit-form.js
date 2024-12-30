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
import FormProvider, { RHFTextField, RHFAutocomplete, RHFUpload, RHFSelect } from 'src/components/hook-form';

import { FetchUserDetail, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { CATEGORY_ENDPOINT, WAREHOUE_RACKS_ENDPOINT, WAREHOUSE_ADD_NAME } from '../../utils/apiEndPoints';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { MenuItem } from '@mui/material';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const Product = Array.isArray(currentProduct) ? currentProduct[0] : currentProduct;
  console.log(Product,"PRODUCT")
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [shapeOptions, setShapeOptions] = useState([]);

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Title is required'),
    warehouse_id: Yup.string().required('Warehouse name is required'),
  });

  const categoriesBasePath = '/assets/images/categories/';

  const defaultValues = useMemo(
    () => ({
      name: Product?.name || '',
      warehouse_id: Product?.warehouse_id || '',
    }),
    [Product]
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
    if (Product) {
      reset(defaultValues);
    }
  }, [Product, defaultValues, reset]);

  async function FetchDetails() {
    const STORAGE_KEY = 'accessToken';
    const user = await FetchUserDetail();
    const accessToken = await sessionStorage.getItem(STORAGE_KEY);
    const decoded = await jwtDecode(accessToken);
  }

  useEffect(() => {
    FetchDetails();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      const user = await FetchUserDetail();

      const apiUrl = Product
        ? `${WAREHOUE_RACKS_ENDPOINT}?id=${Product.id}`
        : WAREHOUE_RACKS_ENDPOINT;
      const fetchMethod = Product ? 'PUT' : 'POST';
      const response = await fetch(apiUrl, {
        method: fetchMethod,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), 
      });

      if (response.ok) {
        enqueueSnackbar(Product ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.warehouse_racks.root);
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

  const getShapeListingData = async (warehouse_id = null) => {
    try {
      const apiUrl = warehouse_id ? `${WAREHOUSE_ADD_NAME}?id=${warehouse_id}` : WAREHOUSE_ADD_NAME;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      // const response = await ManageAPIsData(apiUrl, 'GET');

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setShapeOptions(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getShapeListingData(); // Fetch all shapes on component mount
  }, []);

  useEffect(() => {
    if (Product && Product.warehouse_id) {
      getShapeListingData(Product.warehouse_id);
    }
  }, [Product]);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField id="name" name="name" label="Title" />
            <RHFSelect
              fullWidth
              id="warehouse_id"
              name="warehouse_id"
              label="Warehouse name"
              // InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Warehouse</MenuItem>
              {shapeOptions && shapeOptions.length > 0 && shapeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>

          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!Product ? 'Submit' : 'Update'}
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
  Product: PropTypes.object,
};
