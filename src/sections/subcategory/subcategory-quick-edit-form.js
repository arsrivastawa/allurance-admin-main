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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
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
  RHFUploadCSV,
} from 'src/components/hook-form';
import { assetsPath } from 'src/utils/apiendpoints';
import { CreateRewards, UpdateRewards, UploadCSV } from 'src/api/rewards';
import { DatePicker } from '@mui/x-date-pickers';
import { PRODUCT_GENDER_OPTIONS } from 'src/_mock';
import { CategoryUploadCSV } from 'src/api/category';
import { SubCategoryUploadCSV } from 'src/api/subcategory';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentRewards }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const fetchimages = currentRewards?.file ? `${currentRewards.file}` : '';

  const NewClientSchema = Yup.object().shape({
    file: Yup.mixed()
      .required('File is required')
      .test('fileType', 'Only .csv file are accepted', (value) => {
        if (!value) return false;
        const fileType = value.type;
        return fileType === 'text/csv' || fileType === 'application/vnd.ms-excel';
      }),
  });

  const defaultValues = useMemo(
    () => ({
      file: '',
    }),
    []
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
  }, [reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'file' && value[0]) {
          formData.append(key, value[0]);
        } else {
          formData.append(key, value);
        }
      });
      const resp = await SubCategoryUploadCSV(formData);
      if (resp.status === true) {
        enqueueSnackbar(resp.message, { variant: 'success' });
      }

      router.push(paths.dashboard.subcategory.list);
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
        setValue('file', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('file', null);
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
            ></Box>
            <Box sx={{ gridColumn: 'span 2', mt: 3 }}>
              {values.file ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />{' '}
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    {values.file.name}
                  </Typography>
                  <LoadingButton onClick={handleRemoveFile} sx={{ mt: 2 }} variant="outlined">
                    Remove File
                  </LoadingButton>
                </Box>
              ) : (
                <RHFUploadCSV
                  name="file"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  onDelete={handleRemoveFile}
                />
              )}
              <Typography
                variant="caption"
                sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
              >
                Allowed *.csv
              </Typography>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {'Submit'}
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
