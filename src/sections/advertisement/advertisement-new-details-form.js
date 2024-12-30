import PropTypes from 'prop-types';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Typography,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { assetsPath } from 'src/utils/apiendpoints';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'src/routes/hooks';
import { Controller, useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  AdvertisementType,
  UpdateRecordStatus,
  UsegetAdvertisement,
  UsegetAdvertisements,
} from 'src/api/advertisement';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { formatDate, formatTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentAdvertisement }) {
  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetAdvertisements();
  const advertise = Array.isArray(currentAdvertisement)
    ? currentAdvertisement[0]
    : currentAdvertisement;

  const Record_status_type = [
    { label: 'Pending', id: 1 },
    { label: 'Approved', id: 2 },
    { label: 'Rejected', id: 3 },
  ];

  const router = useRouter();

  const fetchLaptopimages = advertise?.laptop_image
    ? `${advertise.laptop_image}`
    : '';

  const fetchIpadimages = advertise?.tablet_image ? `${advertise.tablet_image}` : '';

  const fetchmobileimages = advertise?.mobile_image
    ? `${advertise.mobile_image}`
    : '';

  const NewClientSchema = Yup.object().shape({
    // record_status_reason: Yup.string().required('Record status reason is required'),
    record_status: Yup.string().required('Record status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      record_status_reason: advertise?.record_status_reason || '',
      record_status: advertise?.record_status || '',
    }),
    [advertise]
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
  }, [advertise, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (advertise) {
        await UpdateRecordStatus(advertise.id, data);
        enqueueSnackbar('Advertisement updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.advertisement.list);
        reset();
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unknown error', { variant: 'error' });
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Advertisement Details</Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Title:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{advertise?.title}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Description:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{advertise?.description}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">URL:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{advertise?.url}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Start date:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{formatDate(advertise?.start_date)}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">End date:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{formatDate(advertise?.end_date)}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Record status name:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{advertise?.record_status_name}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Record Status</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{advertise?.record_status}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Record status reason:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{advertise?.record_status_reason}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Laptop Image</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Avatar
                    src={fetchLaptopimages}
                    variant="rounded"
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Ipad Image</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Avatar
                    src={fetchIpadimages}
                    variant="rounded"
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Mobile Image</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Avatar
                    src={fetchmobileimages}
                    variant="rounded"
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                </Grid>
              </Grid>
            </Stack>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              <Grid item xs={12} md={12} sx={{ mt: 3 }}>
                <Box
                  rowGap={3}
                  columnGap={4}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Record status</InputLabel>
                    <Controller
                      name="record_status"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            {...field}
                            error={!!fieldState.error}
                            disabled={propertyTypesLoading}
                          >
                            {Record_status_type.map((type) => (
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
                  <RHFTextField name="record_status_reason" label="Record status reason" />
                </Box>

                <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    {'Update'}
                  </LoadingButton>
                </Stack>
              </Grid>
            </FormProvider>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

ClientNewEditForm.propTypes = {
  advertise: PropTypes.object,
};
