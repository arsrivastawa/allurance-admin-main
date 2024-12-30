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
  RHFCheckbox,
  RHFEditor,
  RHFMultiCheckbox,
  RHFTextField,
  RHFUpload,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { assetsPath } from 'src/utils/apiendpoints';
import { CreateRewards, UpdateRewards } from 'src/api/rewards';
import { DatePicker } from '@mui/x-date-pickers';
import { PRODUCT_GENDER_OPTIONS } from 'src/_mock';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentRewards }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const fetchimages = currentRewards?.image1 ? `${currentRewards.image1}` : '';

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    points: Yup.number()
      .typeError('Points must be a number')
      .required('Points are required')
      .positive('Points must be a  number')
      .integer('Points must be an integer'),
    start_date: Yup.string()
      .required('Start date is required')
      .test('is-valid-date', 'Start date is not valid', (value) => !isNaN(Date.parse(value))),
    end_date: Yup.string()
      .required('End date is required')
      .test('is-valid-date', 'End date is not valid', (value) => !isNaN(Date.parse(value)))
      .test('is-after-start', 'End date must be after start date', function (value) {
        const { start_date } = this.parent;
        return !value || !start_date || new Date(value) > new Date(start_date);
      }),
    monetary_value: Yup.number()
      .typeError('Monetary value must be a number')
      .required('Monetary value is required')
      .positive('Monetary value must be a  number'),
    description: Yup.string().required('Description is required'),
    image1: Yup.mixed().nullable().required('Image is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentRewards?.title || '',
      points: currentRewards?.points || '',
      start_date: currentRewards?.start_date
        ? format(new Date(currentRewards.start_date), 'yyyy-MM-dd')
        : '',
      end_date: currentRewards?.end_date
        ? format(new Date(currentRewards.end_date), 'yyyy-MM-dd')
        : '',
      monetary_value: currentRewards?.monetary_value || '',
      exclusive: currentRewards?.exclusive || '',
      description: currentRewards?.description || '',
      image1: fetchimages || null,
    }),
    [currentRewards]
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
  }, [currentRewards, reset, defaultValues]);

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
      if (currentRewards) {
        await UpdateRewards(currentRewards.id, formData);
        enqueueSnackbar('Rewards updated successfully!', { variant: 'success' });
      } else {
        await CreateRewards(formData);
        enqueueSnackbar('Rewards created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.rewards.list);
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
              <RHFTextField name="points" label="Points" type="number" />
              <Controller
                name="start_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Start date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? format(new Date(newValue), 'yyyy-MM-dd') : null);
                    }}
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="end_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="End date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? format(new Date(newValue), 'yyyy-MM-dd') : null);
                    }}
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
              <RHFTextField name="monetary_value" label="Monetary value" type="number" />
              <Stack sx={{ mt: 1 }}>
                <RHFCheckbox name="exclusive" label="One redemption per customer" />
              </Stack>
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <Stack spacing={3} sx={{ mt: 3 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1">Description (Term & Condition)</Typography>
                  <RHFEditor name="description" />
                </Stack>
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
                {!currentRewards ? 'Create' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentRewards: PropTypes.object,
};
