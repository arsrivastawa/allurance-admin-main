import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Select,
  Checkbox,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Typography,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFEditor, RHFTextField, RHFUpload } from 'src/components/hook-form';
import { UsegetCategories } from 'src/api/category';
import { CreateBrand, FetchCity, UpdateBrand } from 'src/api/brand';
import { UsegetSubCategories } from 'src/api/subcategory';
import { assetsPath, ImageApi } from 'src/utils/apiendpoints';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentBrand }) {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetSubCategories();
  const { enqueueSnackbar } = useSnackbar();

  const fetchimages = currentBrand?.image1 ? `${currentBrand.image1}` : '';

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    image1: Yup.mixed().nullable().required('Image is required'),
    subcategory_id: Yup.string().required('Subcategory is required'),
    city_id: Yup.string().required('City is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentBrand?.title || '',
      description: currentBrand?.description || '',
      city_id: currentBrand?.city_id || '',
      image1: fetchimages || null,
      subcategory_id: currentBrand?.subcategory_id || '',
    }),
    [currentBrand]
  );

  const methods = useForm({
    resolver: yupResolver(NewClientSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [currentBrand, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image1' && value[0]) {
          formData.append(key, value[0]);
        } else {
          formData.append(key, value);
        }
      });
      if (currentBrand) {
        await UpdateBrand(currentBrand.id, formData);
        enqueueSnackbar('Brand updated successfully!', { variant: 'success' });
      } else {
        await CreateBrand(formData);
        enqueueSnackbar('Brand created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.brand.list);
      reset();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Unknown error', { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('image1', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('image1', null);
  }, [setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await FetchCity();
        setCities(response.data);
      } catch (err) {
        console.log(err);
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <RHFTextField name="title" label="Title" fullWidth />
            <Box
              sx={{ mt: 3 }}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Subcategory name</InputLabel>
                <Controller
                  name="subcategory_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        {...field}
                        label="Brand name"
                        error={!!fieldState.error}
                        disabled={propertyTypesLoading}
                      >
                        {propertyTypesLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={24} />
                          </MenuItem>
                        ) : (
                          propertyTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.title}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText style={{ color: '#FF5630' }}>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>City name</InputLabel>
                <Controller
                  name="city_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        {...field}
                        label="City name"
                        error={!!fieldState.error}
                        disabled={propertyTypesLoading}
                      >
                        {cities.length === 0 ? (
                          <MenuItem disabled>
                            <CircularProgress size={24} />
                          </MenuItem>
                        ) : (
                          cities.map((city) => (
                            <MenuItem key={city.id} value={city.id}>
                              {city.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText style={{ color: '#FF5630' }}>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Stack spacing={3}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Description</Typography>
                  <RHFEditor name="description" fullWidth />
                </Stack>
              </Stack>
            </Box>
            <Box sx={{ mt: 3 }}>
              <RHFUpload
                name="image1"
                maxSize={3145728}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
              />
              <Typography
                variant="caption"
                sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
              >
                Allowed *.jpeg, *.jpg, *.png, *.gif
                <br /> max size of 3MB
              </Typography>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentBrand ? 'Create' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentBrand: PropTypes.object,
};
