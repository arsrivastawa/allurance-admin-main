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

import { UsegetPropertiesType } from 'src/api/propertytype';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFEditor,
  RHFTextField,
  RHFUpload,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { assetsPath } from 'src/utils/apiendpoints';
import { CreatePages, UpdatePages } from 'src/api/pages';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentPages }) {
  const router = useRouter();
  const { products: PROPERTY_TYPE_OPTIONS } = UsegetPropertiesType();
  const { enqueueSnackbar } = useSnackbar();

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentPages?.title || '',
      description: currentPages?.description || '',
    }),
    [currentPages]
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
  }, [currentPages, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPages) {
        await UpdatePages(currentPages.id, data);
        enqueueSnackbar('Pages updated successfully!', { variant: 'success' });
      }
      // else {
      //   await CreatePages(data);
      //   enqueueSnackbar('Pages created successfully!', { variant: 'success' });
      // }
      router.push(paths.dashboard.pages.list);
      reset();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unknown error', { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label="Title" />
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Description</Typography>
              <RHFEditor simple name="description" />
            </Stack>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {'Update'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentPages: PropTypes.object,
};
