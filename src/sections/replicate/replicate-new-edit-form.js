// src/sections/product/product-new-edit-form.js
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

import { ManageAPIsData, createImageOption, fetchDataFromApi } from '../../utils/commonFunction';
import { CATEGORY_ENDPOINT, RESINTYPE_ENDPOINT, SHAPE_ENDPOINT, SIZEFORSHAPE_ENDPOINT, BEZELMATERIAL_ENDPOINT, BEZELCOLOR_ENDPOINT, INNERMATERIAL_ENDPOINT, FLOWER_ENDPOINT, COLORSHADE_ENDPOINT, DESIGNER_ENDPOINT } from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';


// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [stateCategoryOptions, setCategoryOptions] = useState(false);
  const [stateResinOptions, setResinOptions] = useState(false);
  const [stateShapeOptions, setShapeOptions] = useState(false);
  const [stateSizeOptions, setSizeOptions] = useState(false);
  const [stateBezelMaterialOptions, setBezelMaterialOptions] = useState(false);
  const [stateBezelColorOptions, setBezelColorOptions] = useState(false);
  const [stateInnerMaterialOptions, setInnerMaterialOptions] = useState(false);
  const [stateFlowerOptions, setFlowerOptions] = useState(false);
  const [stateColorOptions, setColorOptions] = useState(false);

  const [stateImage1Option, setImage1Option] = useState(false);
  const [stateImage2Option, setImage2Option] = useState(false);
  const [stateImage3Option, setImage3Option] = useState(false);
  const [stateImage4Option, setImage4Option] = useState(false);
  const [stateImage5Option, setImage5Option] = useState(false);
  const [stateImage6Option, setImage6Option] = useState(false);

  const NewProductSchema = Yup.object().shape({
    category_id: Yup.string().required('Category is required'),
    resin_id: Yup.string().required('Resin is required'),
    shape_id: Yup.string().required('Shape is required'),
    size_id: Yup.string().required('Size is required'),
    bezel_material_id: Yup.string().required('Bezel Material is required'),
    bezel_color_id: Yup.string().required('Bezel Color is required'),
    Inner_material_id: Yup.string().required('Inner Material is required'),
    flower_id: Yup.string().required('Flower is required'),
    color_id: Yup.string().required('Color is required'),
    title: Yup.string().required('Title is required'),
  });

  const governmentBasePath = '/assets/images/documents/government/';

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      category_id: currentProduct?.category_id || '',
      resin_id: currentProduct?.resin_id || '',
      shape_id: currentProduct?.shape_id || '',
      size_id: currentProduct?.size_id || '',
      bezel_material_id: currentProduct?.bezel_material_id || '',
      bezel_color_id: currentProduct?.bezel_color_id || '',
      Inner_material_id: currentProduct?.Inner_material_id || '',
      flower_id: currentProduct?.flower_id || '',
      color_id: currentProduct?.color_id || '',
      image1: currentProduct?.image1 || null,
      image2: currentProduct?.image2 || null,
      image3: currentProduct?.image3 || null,
      image4: currentProduct?.image4 || null,
      image5: currentProduct?.image5 || null,
      image6: currentProduct?.image6 || null,
    }),
    [currentProduct]
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


  // HandleImage - While submit time
  const handleImage = async (data, imageKey, stateImageOption) => {
    const image = data[imageKey];
    if (image && Object.keys(image).length) {
      if (typeof image === 'string' && image.includes(governmentBasePath)) {
        data[imageKey] = image.replace(governmentBasePath, '');
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
      const imageKeys = ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
      for (const imageKey of imageKeys) {
        await handleImage(data, imageKey, eval(`state${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}Option`));
      }

      const apiUrl = currentProduct ? `${DESIGNER_ENDPOINT}?id=${currentProduct.id}` : DESIGNER_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.manage_design.root);
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
      setValue('image1', currentProduct ? governmentBasePath + currentProduct.image1 : null);
      setValue('image2', currentProduct ? governmentBasePath + currentProduct.image2 : null);
      setValue('image3', currentProduct ? governmentBasePath + currentProduct.image3 : null);
      setValue('image4', currentProduct ? governmentBasePath + currentProduct.image4 : null);
      setValue('image5', currentProduct ? governmentBasePath + currentProduct.image5 : null);
      setValue('image6', currentProduct ? governmentBasePath + currentProduct.image6 : null);
    }
  }, [currentProduct, setValue]);

  // const [error, setError] = useState("");

  const renderNormalForm = (
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
            <RHFSelect
              fullWidth
              id="category_id"
              name="category_id"
              label="Category"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Category</MenuItem>
              {stateCategoryOptions && stateCategoryOptions.length > 0 && stateCategoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="resin_id"
              name="resin_id"
              label="Resin Type"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Resin</MenuItem>
              {stateResinOptions && stateResinOptions.length > 0 && stateResinOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="shape_id"
              name="shape_id"
              label="Shape"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Shape</MenuItem>
              {stateShapeOptions && stateShapeOptions.length > 0 && stateShapeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.shape}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="size_id"
              name="size_id"
              label="Size For Shape"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Size For Shape</MenuItem>
              {stateSizeOptions && stateSizeOptions.length > 0 && stateSizeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.length} x {option.breadth}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="bezel_material_id"
              name="bezel_material_id"
              label="Bezel Material"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Bezel Material</MenuItem>
              {stateBezelMaterialOptions && stateBezelMaterialOptions.length > 0 && stateBezelMaterialOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="bezel_color_id"
              name="bezel_color_id"
              label="Bezel Color"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Bezel Color</MenuItem>
              {stateBezelColorOptions && stateBezelColorOptions.length > 0 && stateBezelColorOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="Inner_material_id"
              name="Inner_material_id"
              label="Inner Material"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Inner Material</MenuItem>
              {stateInnerMaterialOptions && stateInnerMaterialOptions.length > 0 && stateInnerMaterialOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="flower_id"
              name="flower_id"
              label="Flower"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Flower</MenuItem>
              {stateFlowerOptions && stateFlowerOptions.length > 0 && stateFlowerOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              fullWidth
              id="color_id"
              name="color_id"
              label="Base Color"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Base Color</MenuItem>
              {stateColorOptions && stateColorOptions.length > 0 && stateColorOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="title" label="Title" />
          </Box>
        </Card>
      </Grid>
    </>
  );

  const renderDocumentForm = (
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
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Image1</Typography>
              <RHFUpload
                name="image1"
                maxSize={3145728}
                onDrop={createImageHandler('image1', setImage1Option)}
                onDelete={createRemoveFileHandler('image1')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Image2</Typography>
              <RHFUpload
                name="image2"
                maxSize={3145728}
                onDrop={createImageHandler('image2', setImage2Option)}
                onDelete={createRemoveFileHandler('image2')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle3">Image3</Typography>
              <RHFUpload
                name="image3"
                maxSize={3145728}
                onDrop={createImageHandler('image3', setImage3Option)}
                onDelete={createRemoveFileHandler('image3')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle4">Image4</Typography>
              <RHFUpload
                name="image4"
                maxSize={3145728}
                onDrop={createImageHandler('image4', setImage4Option)}
                onDelete={createRemoveFileHandler('image4')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle5">Image5</Typography>
              <RHFUpload
                name="image5"
                maxSize={3145728}
                onDrop={createImageHandler('image5', setImage5Option)}
                onDelete={createRemoveFileHandler('image5')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle6">Image6</Typography>
              <RHFUpload
                name="image6"
                maxSize={3145728}
                onDrop={createImageHandler('image6', setImage6Option)}
                onDelete={createRemoveFileHandler('image6')}
              />
            </Stack>
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
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>



    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderNormalForm}

        {renderDocumentForm}



        {renderActions}
      </Grid>
    </FormProvider>

  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
