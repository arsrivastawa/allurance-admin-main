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
import Typography from '@mui/material/Typography';
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
  RHFEditor,
} from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import { FetchUserDetail, ManageAPIsData, createImageOption } from '../../utils/commonFunction';
import { BLOG_ENDPOINT, BLOG_CATEGORY_ENDPOINT } from '../../utils/apiEndPoints';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const [blogCategoryOption, setBlogCategoryOption] = useState([]);

  const mdUp = useResponsive('up', 'md');
  const [stateImage1Option, setImage1Option] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
  });

  const blogBastPath = '/assets/images/blog/';

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      category_id: currentProduct?.category_id || '',
      short_description: currentProduct?.short_description || '',
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


  // Listing data
  const getCategoryListData = async (shapeId = null) => {
    try {
      const apiUrl = shapeId ? `${BLOG_CATEGORY_ENDPOINT}?id=${shapeId}` : BLOG_CATEGORY_ENDPOINT;
      const response = await ManageAPIsData(apiUrl, 'GET');

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setBlogCategoryOption(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  // const [error, setError] = useState("");

  const mapPairLabelToValue = (label) => {
    const pairOption = pairs.find((option) => option.label === label);
    return pairOption ? pairOption.value : null;
  };

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
      data.apihitid = user.id
      const apiUrl = currentProduct ? `${BLOG_ENDPOINT}?id=${currentProduct.id}` : BLOG_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const response = await ManageAPIsData(apiUrl, fetchMethod, mappedData);

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.blogs.root);
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
      setValue('image1', currentProduct ? blogBastPath + currentProduct.image1 : null);
      if (currentProduct && currentProduct.role_id) {
        getCategoryListData(currentProduct.role_id);
      }
    }
  }, [currentProduct, setValue]);

  useEffect(() => {
    getCategoryListData(); // Fetch all shapes on component mount
  }, []);


  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>


            <RHFAutocomplete
              id="category_id"
              name="category_id"
              label="Category"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={blogCategoryOption.map((option) => ({ name: option.name, value: option.id }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              // value={methods.watch('category_id')}
              value={blogCategoryOption.find((option) => option.id === methods.watch('category_id')) || null}
              onChange={(e, value) => {
                methods.setValue('category_id', value ? value.value : '');
              }}
            />

            <RHFTextField id="title" name="title" label="Title" />

            <RHFTextField id="short_description" name="short_description" label="Short Description" inputProps={{ maxLength: 150 }} />

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Typography variant="subtitle2">Long Description</Typography>
              <RHFEditor simple name="description" />
            </Stack>

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
