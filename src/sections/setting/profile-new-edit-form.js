import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { countries } from 'src/assets/data';

import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFRadioGroup,
} from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { assetsPath, FetchProfile, UpdateProfile } from 'src/utils/apiendpoints';
import { useAuthContext } from 'src/auth/hooks';
import { usePopover } from 'src/components/custom-popover';
import { DatePicker } from '@mui/x-date-pickers';
import { AuthContext } from 'src/auth/context/jwt';
import { JOB_EXPERIENCE_OPTIONS } from 'src/_mock';
import { format } from 'date-fns';

// ----------------------------------------------------------------------

export default function ProfileNewEditForm() {
  const [tableData, setTableData] = useState();

  const fetchimages = tableData?.profile_url ? `${tableData?.profile_url}` : '';

  const router = useRouter();

  const GENDER = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    mobile: Yup.string().required('Phone number is required'),
    // gender: Yup.string().required('Gender is required'),
    // dob: Yup.string().required('DOB is required'),
    profile_url: Yup.mixed().nullable().required('Image is required'),
  });

  const defaultValues = useMemo(
    () => ({
      first_name: tableData?.first_name || '',
      last_name: tableData?.last_name || '',
      email: tableData?.email || '',
      mobile: tableData?.mobile || '',
      // gender: tableData?.gender || '',
      // dob: tableData?.dob ? format(new Date(tableData.dob), 'yyyy-MM-dd') : null,

      profile_url: fetchimages || null,
    }),
    [tableData]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [tableData, reset, defaultValues]);

  useEffect(() => {
    fetchData();
  }, [enqueueSnackbar]);

  const fetchData = async () => {
    try {
      const response = await FetchProfile();
      setTableData(response.data);
    } catch (err) {
      console.log(err);
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'profile_url' && value[0]) {
          formData.append(key, value);
        } else if (key === 'dob' && value) {
          formData.append(key, format(new Date(value), 'yyyy-MM-dd'));
        } else {
          formData.append(key, value);
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      const response = await UpdateProfile(formData);
      if (response.status) {
        enqueueSnackbar(response.message);
        await fetchData();
      } else {
        enqueueSnackbar(response.message, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Unknown error', { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('profile_url', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="profile_url"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid> */}

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
              <RHFTextField name="first_name" label="First name" />
              <RHFTextField name="last_name" label="Last name" />
              <RHFTextField name="email" label="Email address" />
              <RHFTextField name="mobile" label="Phone number" />
              {/* <RHFRadioGroup row spacing={8} name="gender" options={GENDER} label="Gender" /> */}

              {/* <Controller
                name="dob"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    {...field}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? format(new Date(newValue), 'yyyy-MM-dd') : null);
                    }}
                    format="yyyy-MM-dd"
                    label="DOB"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              /> */}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained">
                {'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProfileNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
