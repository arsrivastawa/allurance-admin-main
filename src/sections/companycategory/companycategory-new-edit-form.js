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
  RHFEditor,
  RHFTextField,
  RHFUpload,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { assetsPath } from 'src/utils/apiendpoints';
import { CreateCompanyCategory, UpdateCompanyCategory } from 'src/api/companycategory';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentCompanyCategory }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentCompanyCategory?.title || '',
      description: currentCompanyCategory?.description || '',
    }),
    [currentCompanyCategory]
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
  }, [currentCompanyCategory, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentCompanyCategory) {
        await UpdateCompanyCategory(currentCompanyCategory.id, data);
        enqueueSnackbar('Company Category updated successfully!', { variant: 'success' });
      } else {
        await CreateCompanyCategory(data);
        enqueueSnackbar('Company Category created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.companycategory.list);
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
              <Box sx={{ gridColumn: 'span 2' }}>
                <Stack spacing={3}>
                  <RHFTextField name="title" label="Title" />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1">Description</Typography>
                    <RHFEditor name="description" />
                  </Stack>
                </Stack>
              </Box>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCompanyCategory ? 'Create' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentCompanyCategory: PropTypes.object,
};
