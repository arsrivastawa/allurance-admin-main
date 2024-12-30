import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Select, Checkbox, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { UsegetAmenities } from 'src/api/amenities';
import { CreateLead, UpdateLead } from 'src/api/leads';
import { UsegetPropertiesType } from 'src/api/propertytype';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentLead }) {
  const router = useRouter();
  const { products: amenities } = UsegetAmenities();
  const { products: PROPERTY_TYPE_OPTIONS } = UsegetPropertiesType();
  const { enqueueSnackbar } = useSnackbar();

  const NewClientSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phone: Yup.string().required('Phone is required'),
    number_of_bedrooms: Yup.number().required('Number of Bedrooms is required'),
    price: Yup.number().required('Price is required'),
    property_type: Yup.number().required('Property Type is required'),
    location: Yup.string().required('Location is required'),
    user_id: Yup.number().required('User ID is required'),
    next_followup_date: Yup.string().required('Next Follow-up Date is required'),
    next_followup_time: Yup.string().required('Next Follow-up Time is required'),
    amenities: Yup.array().of(Yup.number()),
  });

  const defaultValues = useMemo(
    () => ({
      first_name: currentLead?.first_name || '',
      last_name: currentLead?.last_name || '',
      email: currentLead?.email || '',
      phone: currentLead?.phone || '',
      number_of_bedrooms: currentLead?.number_of_bedrooms || '',
      price: currentLead?.price || '',
      property_type: currentLead?.property_type || 2,
      location: currentLead?.location || '',
      user_id: currentLead?.user_id || 1,
      next_followup_date: currentLead?.next_followup_date
        ? format(new Date(currentLead.next_followup_date), 'yyyy-MM-dd')
        : '',
      next_followup_time: currentLead?.next_followup_time || '',
      created: currentLead?.created || '',
      amenities: currentLead?.amenities || [],
    }),
    [currentLead]
  );

  const methods = useForm({
    resolver: yupResolver(NewClientSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [currentLead, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {

    try {
      if (currentLead) {
        await UpdateLead(currentLead.id, data);
        enqueueSnackbar('Lead updated successfully!', { variant: 'success' });
      } else {
        await CreateLead(data);
        enqueueSnackbar('Lead created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.leads.list);
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
              <RHFTextField name="first_name" label="First Name" />
              <RHFTextField name="last_name" label="Last Name" />
              <RHFTextField name="email" label="Email" />
              <RHFTextField name="phone" label="Phone" />
              <RHFTextField name="number_of_bedrooms" label="Number of Bedrooms" />
              <RHFTextField name="price" label="Price" />
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Controller
                  name="property_type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select {...field} label="Property Type" error={!!fieldState.error}>
                        {PROPERTY_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.property_type}
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
              <RHFTextField name="location" label="Location" />
              <RHFTextField
                name="next_followup_date"
                label="Next Follow-up Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField
                name="next_followup_time"
                label="Next Follow-up Time"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentLead ? 'Create Lead' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentLead: PropTypes.object,
};
