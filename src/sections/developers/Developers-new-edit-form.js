import * as Yup from 'yup';
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
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
  Checkbox,
  ListItemText,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';

import { UsegetAmenities } from 'src/api/amenities';
import { UsegetPropertiesType } from 'src/api/propertytype';
import { CreateProperty, UpdateProperty } from 'src/api/properties';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUpload } from 'src/components/hook-form';

export default function PropertyForm({ currentProperty }) {
  const router = useRouter();
  const { products: amenities } = UsegetAmenities();
  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetPropertiesType();
  const { enqueueSnackbar } = useSnackbar();

  const PropertySchema = Yup.object().shape({
    developer_name: Yup.string().required('Developer Name is required'),
    location: Yup.string().required('Location is required'),
    starting_price: Yup.number().required('Starting Price is required').positive(),
    number_of_bathrooms: Yup.number().required('Number of Bedrooms is required'),
    property_type_id: Yup.string().required('Property Type is required'),
    owner_name: Yup.string().required('Owner Name is required'),
    amenities: Yup.array().of(Yup.number()),
    handover_date: Yup.date().required('Handover Date is required'),
    sqft_starting_size: Yup.number().required('Sqft: Starting Size is required').positive(),
    parking: Yup.string().required('Parking status is required'),
    furnished: Yup.string().required('Furnishing status is required'),
    account_type: Yup.string().required('Leasehold/Freehold is required'),
    // leasehold_length: Yup.number().when('account_type', {
    //   is: 'Leasehold',
    //   then: Yup.number().required('Leasehold Length is required').positive(),
    // }),
    files: Yup.array().min(1, 'Images are required'),
  });

  const { user } = useAuthContext();
  const Token = user.accessToken;

  const defaultValues = useMemo(
    () => ({
      developer_name: currentProperty?.developer_name || '',
      property_type_id: currentProperty?.property_type_id || '',
      location: currentProperty?.location || '',
      starting_price: currentProperty?.starting_price || '',
      number_of_bathrooms: currentProperty?.number_of_bathrooms || '',
      owner_name: currentProperty?.owner_name || '',
      handover_date: currentProperty?.handover_date || '',
      sqft_starting_size: currentProperty?.sqft_starting_size || '',
      parking: currentProperty?.parking || 'No',
      furnished: currentProperty?.furnished || 'No',
      account_type: currentProperty?.account_type || 'Freehold',
      leasehold_length: currentProperty?.leasehold_length || '455',
      amenities: currentProperty?.amenities || [],
      files: (currentProperty?.files || []).map((imageFilename) => ({
        preview: `${imageFilename}`,
      })),
    }),
    [currentProperty]
  );

  const methods = useForm({
    resolver: yupResolver(PropertySchema),
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
  }, [currentProperty, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    // console.log("data", data);

    try {
      // console.log('datadata', data);
      const formData = new FormData();

      // Iterate over the data object and append key-value pairs
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          // Handle arrays
          data[key].forEach((value) => formData.append(key, value));
        } else if (key === 'handover_date' && data[key]) {
          // Format the handover_date
          const date = new Date(data[key]);
          const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
          formData.append(key, formattedDate);
        } else {
          // Append other key-value pairs
          formData.append(key, data[key]);
        }
      });

      const fileInputs = document.querySelector('input[type="file"]');
      if (fileInputs && fileInputs.files) {
        Array.from(fileInputs.files).forEach((file) => formData.append('files', file));
      }

      // Log FormData contents
      // for (let pair of formData.entries()) {
      //   console.log(`${pair[0]}: ${pair[1]}`);
      // }

      if (currentProperty) {
        await UpdateProperty(currentProperty.id, formData);
        enqueueSnackbar('Property updated successfully!', { variant: 'success' });
      } else {
        // console.log("=====>", formData);

        await CreateProperty(formData, Token);
        enqueueSnackbar('Property created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.propertypage.root);
      reset();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unknown error', { variant: 'error' });
    }
  });

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.files.filter((file) => file.preview !== inputFile.preview);
      setValue('files', filtered);
    },
    [setValue, values.files]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('files', []);
  }, [setValue]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const files = values.files || [];
      const newFiles = await Promise.all(
        acceptedFiles.map(async (file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
      setTimeout(() => {
        setValue('files', [...files, ...newFiles], { shouldValidate: true });
      }, 10);
    },
    [setValue, values.files]
  );

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
              <RHFTextField name="developer_name" label="Developer Name" />
              <RHFTextField name="location" label="Location" />
              <RHFTextField name="starting_price" label="Starting Price" />

              <FormControl fullWidth>
                <InputLabel>Number of Bedrooms</InputLabel>
                <Controller
                  name="number_of_bathrooms"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select {...field} label="Number of Bedrooms" error={!!fieldState.error}>
                        <MenuItem value="0">Studio</MenuItem>
                        <MenuItem value="1">1 bed</MenuItem>
                        <MenuItem value="2">2 bed</MenuItem>
                        <MenuItem value="3">3 bed</MenuItem>
                        <MenuItem value="4">4 bed</MenuItem>
                        <MenuItem value="5">5 bed</MenuItem>
                        <MenuItem value="6">6 bed</MenuItem>
                        <MenuItem value="7">7 bed</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Controller
                  name="property_type_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        {...field}
                        label="Property Type"
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
                              {type.property_type}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>

              <RHFTextField name="owner_name" label="Owner Name" />
              <RHFTextField name="handover_date" type="date" label="Handover Date" />
              <RHFTextField name="sqft_starting_size" label="Sqft: Starting Size" />

              <FormControl fullWidth>
                <InputLabel>Parking</InputLabel>
                <Controller
                  name="parking"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select {...field} label="Parking" error={!!fieldState.error}>
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Furnished</InputLabel>
                <Controller
                  name="furnished"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select {...field} label="Furnished" error={!!fieldState.error}>
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Leasehold/Freehold</InputLabel>
                <Controller
                  name="account_type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select {...field} label="Leasehold/Freehold" error={!!fieldState.error}>
                        <MenuItem value="Leasehold">Leasehold</MenuItem>
                        <MenuItem value="Freehold">Freehold</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>

              {values.account_type === 'Leasehold' && (
                <RHFTextField name="leasehold_length" label="Leasehold Length" />
              )}

              <Controller
                name="amenities"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Amenities</InputLabel>
                    <Select
                      {...field}
                      // multiple
                      renderValue={(selected) =>
                        selected
                          .map((id) => amenities.find((amenity) => amenity.id === id)?.amenity_name)
                          .join(', ')
                      }
                    >
                      {amenities.map((amenity) => (
                        <MenuItem key={amenity.id} value={amenity.id}>
                          <Checkbox checked={field.value.includes(amenity.id)} />
                          <ListItemText primary={amenity.amenity_name} />
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && (
                      <FormHelperText>{fieldState.error.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Box sx={{ gridColumn: 'span 2' }}>
                <RHFUpload
                  multiple
                  thumbnail
                  name="files"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => console.log('ON UPLOAD')}
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
                {!currentProperty ? 'Create Property' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

PropertyForm.propTypes = {
  currentProperty: PropTypes.object,
};
