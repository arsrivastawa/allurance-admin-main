// src/sections/settings/aboutus-form.js
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
  RHFEditor,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';

import { FetchUserDetail, ManageAPIsData, createImageOption } from '../../utils/commonFunction';
import { ABOUT_ENDPOINT } from '../../utils/apiEndPoints';

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
  const [stateImage1Option, setImage1Option] = useState(false);
  const [tableData, setTableData] = useState([]);

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    short_description: Yup.string().required('Short Description is required'),
  });

  const blogBastPath = '/assets/images/blog/';

  const defaultValues = useMemo(
    () => ({
      title: tableData?.title || '',
      short_description: tableData?.short_description || '',
      long_description: tableData?.long_description || '',
      image1: tableData?.image1 || null,
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

  // HandleImage - While submit time
  const handleImage = async (data, imageKey, stateImageOption) => {
    const image = data[imageKey];
    if (image && Object.keys(image).length) {
      if (typeof image === 'string' && image.includes(blogBastPath)) {
        data[imageKey] = image.replace(blogBastPath, '');
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
      const user = await FetchUserDetail();
      data.apihitid = user.id
      // Handle Image Process
      const imageKeys = ['image1'];
      for (const imageKey of imageKeys) {
        await handleImage(data, imageKey, eval(`state${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}Option`));
      }

      const apiUrl = `${ABOUT_ENDPOINT}?id=1`;
      const fetchMethod = "PUT";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);



      if (response.ok) {
        enqueueSnackbar('Update success!');
        getListingData();
        router.push(paths.dashboard.settings.aboutus);
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

  // Listing data
  const getListingData = async () => {
    try {

      const response = await ManageAPIsData(`${ABOUT_ENDPOINT}?id=1`, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();
      // if (typeof responseData === 'object' && responseData.data) {


      setTableData(responseData.data[0]);
      // }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (tableData) {
      setValue('image1', tableData ? blogBastPath + tableData.image1 : null);
    }
  }, [tableData, setValue]);

  useEffect(() => {
    getListingData();
  }, []);


  const renderAddressForm = (
    <>

      <Grid xs={12} md={12}>
        <Card sx={{ p: 3 }}>
          {/* <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          > */}

          <Stack spacing={3} sx={{ mb: 3 }}>
            <RHFTextField name="title" label="Title" />
          </Stack>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <RHFTextField name="short_description" label="Short Description" />
          </Stack>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Long Description</Typography>
            <RHFEditor simple name="long_description" />
          </Stack>


          <RHFUpload
            name="image1"
            maxSize={3145728}
            onDrop={createImageHandler('image1', setImage1Option)}
            onDelete={createRemoveFileHandler('image1')}
          />




          {/* </Box> */}

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
