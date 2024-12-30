// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
// import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

// import {
//   _tags,
// } from 'src/_mock';

import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  // RHFAutocomplete,
} from 'src/components/hook-form';
// import axios from 'axios';


import { FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { SHAPE_ENDPOINT, SIZEFORSHAPE_ENDPOINT } from '../../utils/apiEndPoints';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [shapeOptions, setShapeOptions] = useState([]);

  const NewProductSchema = Yup.object().shape({
    length: Yup.string().required('Length is required'),
    breadth: Yup.string().required('Breadth is required'),
  });

  const defaultValues = useMemo(
    () => ({
      shape_id: currentProduct?.shape_id || '',
      length: currentProduct?.length || '',
      breadth: currentProduct?.breadth || '',
      description: currentProduct?.description || '',
    }),
    [currentProduct]
  );

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
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      const user = await FetchUserDetail();
      data.apihitid = user.id
      const apiUrl = currentProduct ? `${SIZEFORSHAPE_ENDPOINT}?id=${currentProduct.id}` : SIZEFORSHAPE_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.sizeforshape.root);
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
  const getShapeListingData = async (shapeId = null) => {
    try {
      const apiUrl = shapeId ? `${SHAPE_ENDPOINT}?id=${shapeId}` : SHAPE_ENDPOINT;
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
    if (currentProduct && currentProduct.shape_id) {
      getShapeListingData(currentProduct.shape_id);
    }
  }, [currentProduct]);

  // const handleInput = (e) => {
  //   methods.setValue('shape_id', e.target.value);
  // };

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>


            <RHFSelect
              fullWidth
              id="shape_id"
              name="shape_id"
              label="Shape"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Shape</MenuItem>
              {shapeOptions && shapeOptions.length > 0 && shapeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.shape}
                </MenuItem>
              ))}
            </RHFSelect>


            <RHFTextField id="length" name="length" label="Length" />


            <RHFTextField id="breadth" name="breadth" label="Breadth" />


            <RHFTextField id="description" name="description" label="Description" multiline rows={4} />

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
