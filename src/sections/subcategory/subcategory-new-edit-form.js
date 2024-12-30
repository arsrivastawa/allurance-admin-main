import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useCallback } from 'react';
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

import { UsegetPropertiesType } from 'src/api/propertytype';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFEditor, RHFTextField, RHFUpload } from 'src/components/hook-form';
import { CreateSubCategory, UpdateSubCategory, UsegetSubCategories } from 'src/api/subcategory';
import { UsegetCategories } from 'src/api/category';
import { assetsPath } from 'src/utils/apiendpoints';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentSubCategory }) {
  const router = useRouter();
  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetCategories();
  const { enqueueSnackbar } = useSnackbar();

  const fetchimages = currentSubCategory?.image1
    ? `${currentSubCategory.image1}`
    : '';

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    points: Yup.number()
      .typeError('Points must be a number')
      .required('Points are required')
      .positive('Points must be a  number')
      .integer('Points must be an integer'),
    description: Yup.string().required('Description is required'),
    image1: Yup.mixed().nullable().required('Image is required'),
    category_id: Yup.string().required('Category is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentSubCategory?.title || '',
      points: currentSubCategory?.points || '',
      description: currentSubCategory?.description || '',
      image1: fetchimages || null,
      category_id: currentSubCategory?.category_id || '',
    }),
    [currentSubCategory]
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
  }, [currentSubCategory, reset, defaultValues]);

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
      if (currentSubCategory) {
        await UpdateSubCategory(currentSubCategory.id, formData);
        enqueueSnackbar('SubCategory updated successfully!', { variant: 'success' });
      } else {
        await CreateSubCategory(formData);
        enqueueSnackbar('SubCategory created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.subcategory.list);
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

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Category name</InputLabel>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        {...field}
                        label="Category name"
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
              <RHFTextField name="title" label="Title" />
              <RHFTextField name="points" label="Points" type="number" />
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Typography variant="subtitle2">Description</Typography>
                <RHFEditor name="description" fullWidth />
              </Stack>
            </Box>
            <Box sx={{ gridColumn: 'span 2', mt: 3 }}>
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
                {!currentSubCategory ? 'Create ' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentSubCategory: PropTypes.object,
};
