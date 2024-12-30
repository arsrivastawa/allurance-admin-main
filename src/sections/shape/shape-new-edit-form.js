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
// import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

// import {
//   _tags,
// } from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  // RHFAutocomplete,
} from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import { SHAPE_ENDPOINT } from '../../utils/apiEndPoints';
import { FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();
  const [sequence, setSequence] = useState(0);

  const fetchData = async () => {
    try {
      const apiUrl = `${SHAPE_ENDPOINT}/sequenceNumber`;
      const response = await ManageAPIsData(apiUrl, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      setSequence(responseData.data.seq);
      console.log('currentProductcurrentProduct',currentProduct);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 

  const NewProductSchema = Yup.object().shape({
    sequence_number: Yup.string().required('Sequence Number is required'),
    shape: Yup.string().required('Shape is required'),
  });

  const defaultValues = useMemo(
    () => ({
      sequence_number:currentProduct?.sequence_number || sequence,
      shape: currentProduct?.shape || '',
      description: currentProduct?.description || '',
    }),
    [currentProduct, sequence]
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
   
  useEffect(() => {
    const fetchDataAsync = async () => {
      await fetchData();
    };
  
    fetchDataAsync();
  }, []);

  // const [error, setError] = useState("");

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    try {

      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      if(currentProduct?.sequence_number == undefined) {
        data.sequence_number = sequence;
      }

      const user = await FetchUserDetail();
      data.apihitid = user.id
      const apiUrl = currentProduct ? `${SHAPE_ENDPOINT}?id=${currentProduct.id}` : SHAPE_ENDPOINT;
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
        router.push(paths.dashboard.shape.root);
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


            <RHFTextField id="sequence_number" name="sequence_number" label="Sequence Number" value={currentProduct?.sequence_number || sequence} disabled />
      

            <RHFTextField id="shape" name="shape" label="Shape" />


            <RHFTextField id="description" name="description" label="Description" multiline rows={4} />

            {/* <RHFSelect
              fullWidth
              name="pair"
              label="Pair"
              InputLabelProps={{ shrink: true }}
              defaultValue="Select Pair"
            >
              {['Yes', 'No'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </RHFSelect> */}



          </Stack>
        </Card>
      </Grid>

      {/* {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, Description
          </Typography>
        </Grid>
      )} */}
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
