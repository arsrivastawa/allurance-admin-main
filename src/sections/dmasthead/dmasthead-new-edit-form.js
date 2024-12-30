// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
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
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import { FetchUserDetail, ManageAPIsData, createImageOption } from '../../utils/commonFunction';
import { DESKTOP_MASTHEAD_ENDPOINT } from '../../utils/apiEndPoints';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');
  const [stateImage1Option, setImage1Option] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    button_name: Yup.string().required('Button Name is required'),
    button_link: Yup.string().required('Button Link is required'),
    button_target: Yup.string().required('Target is required'),
  });

  const mastheadBasePath = '/assets/images/masthead/dmasthead/';

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      button_name: currentProduct?.button_name || '',
      button_link: currentProduct?.button_link || '',
      button_target: currentProduct?.button_target || '',
      description: currentProduct?.description || '',
      image1: currentProduct?.image1 || null,
    }),
    [currentProduct]
  );

  const pairs = [
    { value: '1', label: '_blank' },
    { value: '2', label: '_self' },
  ];

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



  // const [error, setError] = useState("");

  const mapPairLabelToValue = (label) => {
    const pairOption = pairs.find((option) => option.label === label);
    return pairOption ? pairOption.value : null;
  };

  // HandleImage - While submit time
  const handleImage = async (data, imageKey, stateImageOption) => {
    const image = data[imageKey];
    if (image && Object.keys(image).length) {
      if (typeof image === 'string' && image.includes(mastheadBasePath)) {
        data[imageKey] = image.replace(mastheadBasePath, '');
      }
      if (stateImageOption) {
        data[imageKey].imgData = await createImageOption(data, imageKey);
      }
    }
  };

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    try {


      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();

      // Handle Image Process
      const imageKeys = ['image1'];
      for (const imageKey of imageKeys) {
        await handleImage(data, imageKey, eval(`state${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}Option`));
      }

      const mappedData = {
        ...data,
        pair: mapPairLabelToValue(data.pair),
      };
      const user = await FetchUserDetail();
      mappedData.apihitid = user.id
      const apiUrl = currentProduct ? `${DESKTOP_MASTHEAD_ENDPOINT}?id=${currentProduct.id}` : DESKTOP_MASTHEAD_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const response = await ManageAPIsData(apiUrl, fetchMethod, mappedData);

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.dmasthead.root);
      } else {
        const responseData = await response.json();
        // Check if the response contains an error message
        if (responseData && responseData.error) {
          // Display the error message to the user, for example, using a notification library
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }

    } catch (err) {
      console.error(err.message);
    }
  });

  // Image Handler
  const createImageHandler = (imageKey, setOption) => useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = file && Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      setValue(imageKey, newFile, { shouldValidate: true });
      setOption(true);
    },
    [setValue, setOption]
  );

  const createRemoveFileHandler = (imageKey) => useCallback(() => {
    setValue(imageKey, null);
  }, [setValue]);

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (currentProduct) {
      setValue('image1', currentProduct ? mastheadBasePath + currentProduct.image1 : null);
    }
  }, [currentProduct, setValue]);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>


            <RHFTextField id="title" name="title" label="Title" />

            <RHFTextField id="button_name" name="button_name" label="Button Name" />

            <RHFTextField id="button_link" name="button_link" label="Button Link" />


            <RHFAutocomplete
              name="button_target"
              id="button_target"
              type="button_target"
              label="Target"
              placeholder="Select Target"
              fullWidth
              options={pairs.map((option) => option.label)}
              getOptionLabel={(option) => option}
            />


            <RHFTextField id="description" name="description" label="Description" multiline rows={4} />

            <RHFUpload
              name="image1"
              maxSize={3145728}
              onDrop={createImageHandler('image1', setImage1Option)}
              onDelete={createRemoveFileHandler('image1')}
            />

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
