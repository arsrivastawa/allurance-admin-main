import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback } from 'react';
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
} from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { CHANGE_PASSWORD, ChangePassword } from 'src/utils/apiendpoints';
import { useAuthContext } from 'src/auth/hooks';
import { usePopover } from 'src/components/custom-popover';
import { error } from 'src/theme/palette';

// ----------------------------------------------------------------------

export default function UserNewEditForm() {
  const router = useRouter();
  const { logout } = useAuthContext();
  const popover = usePopover();
  const currentpassword = useBoolean();
  const newpassword = useBoolean();
  const confirmpassword = useBoolean();

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/auth/jwt/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    current_password: Yup.string().required('Current Password is required'),
    new_password: Yup.string().required('New Password is required'),
    confirm_password: Yup.string().required('Confirm Password is required'),
  });

  const defaultValues = useMemo(
    () => ({
      current_password: '',
      new_password: '',
      confirm_password: '',
    }),
    []
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      const response = await ChangePassword(data);
      if (response.status) {
        enqueueSnackbar(response.message);
        handleLogout();
      } else {
        enqueueSnackbar(response.error || 'Unknown errora', { variant: 'error' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Unknown error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
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
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField
                name="current_password"
                label="Current Password"
                type={currentpassword.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={currentpassword.onToggle} edge="end">
                        <Iconify
                          icon={currentpassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <RHFTextField
                name="new_password"
                label="New Password"
                type={newpassword.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={newpassword.onToggle} edge="end">
                        <Iconify
                          icon={newpassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <RHFTextField
                name="confirm_password"
                label="Confirm Password"
                type={confirmpassword.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={confirmpassword.onToggle} edge="end">
                        <Iconify
                          icon={confirmpassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Grid xs={12} md={12} sx={{ display: 'flex', justifyContent: 'end' }} spacing={3}>
              <LoadingButton type="submit" size="medium" variant="contained" loading={isSubmitting}>
                {'Change'}
              </LoadingButton>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
