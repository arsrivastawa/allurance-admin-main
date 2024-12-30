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

// import { CreateLead, UpdateLead } from 'src/api/leads';
import { UsegetPropertiesType } from 'src/api/propertytype';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUpload, RHFUploadAvatar } from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { assetsPath } from 'src/utils/apiendpoints';
import { CreateSocialMedia, UpdateSocialMedia } from 'src/api/socialmedia';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentSocialmedia }) {
  const router = useRouter();
  const { products: PROPERTY_TYPE_OPTIONS } = UsegetPropertiesType();
  const { enqueueSnackbar } = useSnackbar();

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    social_link: Yup.string().url('Invalid URL format').required('Social link is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentSocialmedia?.title || '',
      social_link: currentSocialmedia?.social_link || '',
    }),
    [currentSocialmedia]
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
  }, [currentSocialmedia, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentSocialmedia) {
        await UpdateSocialMedia(currentSocialmedia.id, data);
        enqueueSnackbar('Social links updated successfully!', { variant: 'success' });
      } else {
        await CreateSocialMedia(data);
        enqueueSnackbar('Social links created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.socialmedia.list);
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
              <RHFTextField name="title" label="Title" />
              <RHFTextField name="social_link" label="Social link" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentSocialmedia ? 'Create' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentSocialmedia: PropTypes.object,
};
