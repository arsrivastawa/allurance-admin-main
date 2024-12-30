import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import * as Yup from 'yup';
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
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField } from 'src/components/hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { UpdateRecordStatus } from 'src/api/advertisement';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { ImageFetchData, UpdateRecordStatusReview, UsegetReviews } from 'src/api/review';
import { useRouter } from 'src/routes/hooks';
import axios from 'axios';
import { endpoints } from 'src/utils/axios';
import { assetsPath } from 'src/utils/apiendpoints';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentReview }) {
  const review = Array.isArray(currentReview) ? currentReview[0] : currentReview;
  const recommended = review?.product_recommended === 'N' ? 'No' : 'Yes';
  const [tableData, setTableData] = useState([]);

  const router = useRouter();

  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetReviews();

  const NewClientSchema = Yup.object().shape({
    admin_status: Yup.string().required('Record status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      admin_status: review?.admin_status || '',
    }),
    [review]
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
  }, [review, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (review) {
        await UpdateRecordStatusReview(review.id, data);
        enqueueSnackbar('Advertisement updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.review.list);
        reset();
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unknown error', { variant: 'error' });
    }
  });

  const Record_status_type = [
    { label: 'Pending', id: 1 },
    { label: 'Approved', id: 2 },
    { label: 'Rejected', id: 3 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (review) {
          const response = await ImageFetchData(review.id);
          setTableData(response?.data);
        }
      } catch (error) {
        console.log(error);
        // enqueueSnackbar(error.response?.data?.error || 'Unknown error', { variant: 'error' });
      }
    };
    fetchData();
  }, [review, enqueueSnackbar]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Product Review Details</Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">First Name:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.user_first_name || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Last Name:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.user_last_name || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">User Email:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.user_email || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Product Name:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.product_name || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Product Short Description:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.product_short_desc || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Rating:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.rating || '--'}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Product Recommended:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{recommended || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Overall Experience:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.overall_exp || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Most Love:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.most_love || '--'}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Most Worst:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.most_wrost || '--'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">ChatGpt Response:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1">{review?.chatgpt_response || '--'}</Typography>
                </Grid>
              </Grid>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 3 }}>
              {tableData && tableData.length > 0 ? (
                tableData.map((image, index) => (
                  <Grid item xs={2} key={index}>
                    <Avatar
                      src={`${assetsPath}/${image.file_url}`}
                      variant="rounded"
                      sx={{ width: 100, height: 100, mr: 2 }}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2">No images found</Typography>
                </Grid>
              )}
            </Grid>

            <FormProvider methods={methods} onSubmit={onSubmit}>
              <Grid container spacing={2} sx={{ mt: 5 }}>
                <Grid item xs={12} md={8}>
                  {' '}
                  <FormControl fullWidth>
                    <InputLabel>Admin status</InputLabel>
                    <Controller
                      name="admin_status"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            {...field}
                            error={!!fieldState.error}
                            disabled={propertyTypesLoading}
                            label="Admin Status"
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
                </Grid>

                <Grid item xs={12} md={4} sx={{ mt: 1 }}>
                  {' '}
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting} fullWidth>
                    {'Update'}
                  </LoadingButton>
                </Grid>
              </Grid>
            </FormProvider>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

ClientNewEditForm.propTypes = {
  review: PropTypes.object,
};
