import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { UsegetAmenities } from 'src/api/amenities';
import { createClient, updateClient } from 'src/api/clients';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentClient }) {
  const router = useRouter();
  const { products: amenities } = UsegetAmenities();
  const { enqueueSnackbar } = useSnackbar();

  const NewClientSchema = Yup.object().shape({
    customer_name: Yup.string().required('Customer Name is required'),
    customer_mobile: Yup.string().required('Customer Mobile is required'),
    customer_email: Yup.string()
      .required('Customer Email is required')
      .email('Email must be a valid email address'),
    purchase_type: Yup.string().required('Purchase Type is required'),
    location: Yup.string().required('Location is required'),
    number_of_bathrooms: Yup.string().required('Number of Bathrooms is required'),
    amenities: Yup.array().of(Yup.number()),
  });

  const defaultValues = useMemo(
    () => ({
      customer_name: currentClient?.customer_name || '',
      customer_mobile: currentClient?.customer_mobile || '',
      customer_email: currentClient?.customer_email || '',
      customer_address: currentClient?.customer_address || '',
      number_of_bedrooms: currentClient?.number_of_bedrooms || '',
      number_of_bathrooms: currentClient?.number_of_bathrooms || '',
      price: currentClient?.price || '',
      purchase_type: currentClient?.purchase_type || 'cash',
      location: currentClient?.location || '',
      user_id: currentClient?.user_id || '',
      created: currentClient?.created || '',
      status: currentClient?.status || 1,
      amenities: currentClient?.amenities || [],
      currency: currentClient?.currency || 'AED',
    }),
    [currentClient]
  );

  const methods = useForm({
    resolver: yupResolver(NewClientSchema),
    defaultValues,
  });

  const PURCHASE_TYPE_OPTIONS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mortgage', label: 'Mortgage' },
  ];

  const CURRENCY_OPTIONS = [
    { value: 'AED', label: 'AED' },
    { value: 'GBP', label: 'Pound' },
  ];

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [currentClient, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentClient) {
        await updateClient(currentClient.id, data);
        enqueueSnackbar('Client updated successfully!', { variant: 'success' });
      } else {
        await createClient(data);
        enqueueSnackbar('Client created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.clients.list);
      reset();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unknown error', { variant: 'error' });
    }
  });

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
              <RHFTextField name="customer_name" label="Customer Name" />
              <RHFTextField name="customer_mobile" label="Customer Mobile" />
              <RHFTextField name="customer_email" label="Customer Email" />
              <RHFTextField name="customer_address" label="Customer Address" />
              <RHFTextField name="number_of_bedrooms" label="Number of Bedrooms" />
              <RHFTextField name="number_of_bathrooms" label="Number of Bathrooms" />

              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price"
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <FormControl sx={{ minWidth: 80 }}>
                            <InputLabel id="currency-select-label">Currency</InputLabel>
                            <Controller
                              name="currency"
                              control={control}
                              render={({ fields }) => (
                                <Select
                                  {...fields}
                                  labelId="currency-select-label"
                                  label="Currency"
                                >
                                  {CURRENCY_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                          </FormControl>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <FormControl fullWidth>
                <InputLabel>Purchase Type</InputLabel>
                <Controller
                  name="purchase_type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select {...field} label="Purchase Type" error={!!fieldState.error}>
                        {PURCHASE_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>

              <Controller
                name="amenities"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Amenities</InputLabel>
                    <Select
                      {...field}
                      multiple
                      value={field.value || []}
                      onChange={(event) => field.onChange(event.target.value)}
                      renderValue={(selected) =>
                        selected
                          .map(
                            (value) =>
                              amenities.find((amenity) => amenity.id === value)?.amenity_name
                          )
                          .filter(Boolean)
                          .join(', ')
                      }
                    >
                      {amenities.map((amenity) => (
                        <MenuItem key={amenity.id} value={amenity.id}>
                          <Checkbox checked={field.value.includes(amenity.id)} />
                          {amenity.amenity_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <RHFTextField
                name="location"
                label="Location"
                fullWidth
                multiline
                rows={4}
                sx={{
                  gridColumn: 'span 2', // Ensures it spans both columns
                }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentClient ? 'Create Client' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentClient: PropTypes.object,
};
