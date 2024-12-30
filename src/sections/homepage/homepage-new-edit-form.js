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
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFAutocomplete,
  RHFEditor,
  RHFTextField,
  RHFUpload,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { assetsPath } from 'src/utils/apiendpoints';
// import { CreateHome, HomeData, UpdateHome, UsegetHomes } from 's';
import { countries } from 'src/assets/data';
import { UsegetHomes,CreateHome,HomeData,UpdateHome } from 'src/api/homepage';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentHome }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetHomes();

  const fetchimages = currentHome?.image1 ? `${currentHome.image1}` : '';

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    button_name: Yup.string().required('Button name is required'),
    button_link: Yup.string().url('Invalid URL format').required('Button link is required'),
    type: Yup.string().required('Type is required'),
    image1: Yup.mixed().nullable().required('Image is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentHome?.title || '',
      type: currentHome?.type || '',
      description: currentHome?.description || '',
      button_name: currentHome?.button_name || '',
      button_link: currentHome?.button_link || '',
      image1: fetchimages || null,
    }),
    [currentHome]
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
  }, [currentHome, reset, defaultValues]);

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
      if (currentHome) {
        await UpdateHome(currentHome.id, formData);
        enqueueSnackbar('Home updated successfully!', { variant: 'success' });
      } else {
        await CreateHome(formData);
        enqueueSnackbar('Home created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.homepage.list);
      reset();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unknown error', { variant: 'error' });
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
              }}
            >
              <RHFTextField name="title" label="Title" />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        {...field}
                        error={!!fieldState.error}
                        disabled={propertyTypesLoading}
                        label="Type"
                      >
                        {HomeData.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.label}
                          </MenuItem>
                        ))}
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
              <RHFTextField name="button_name" label="Button name" />
              <RHFTextField name="button_link" label="Button link" />

              <Box sx={{ gridColumn: 'span 2' }}>
                <Stack spacing={3}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Description</Typography>
                    <RHFEditor name="description" />
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ gridColumn: 'span 2' }}>
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
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentHome ? 'Create' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentHome: PropTypes.object,
};
