"use client";
import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ManageAPIsData } from '../../../utils/commonFunction';
import { LOGIN_ENDPOINT } from '../../../utils/apiEndPoints';
import { setSession } from '../../../auth/context/jwt/utils';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useSnackbar } from 'src/components/snackbar';

export default function JwtLoginView() {
  const { login } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    prefix_id: Yup.string().required('Prefix is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    prefix_id: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  // const onSubmit = async (data, e) => {
  // const onSubmit = handleSubmit(async (data, e) => {
  //   e.preventDefault();
  //   try {
  //     const apiUrl = LOGIN_ENDPOINT;
  //     const fetchMethod = "POST";
  //     const response = await ManageAPIsData(apiUrl, fetchMethod, data);
  //     const responseData = await response.json();

  //     if (response.ok) {
  //       setSession(responseData.data);
  //       enqueueSnackbar('Login Success');
  //       router.push(returnTo || PATH_AFTER_LOGIN);
  //     } else {
  //       reset();
  //       enqueueSnackbar(responseData.error, { variant: 'error' });
  //       setErrorMsg(responseData.message);
  //     }
  //   } catch (err) {
  //     reset();
  //     setErrorMsg('Something went wrong while logging in! Please try again later.');
  //   } finally {
  //     reset();
  //   }
  // });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.prefix_id, data.password);
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to Allurance</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField name="prefix_id" label="User ID" />
      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
          autoComplete: "current-password",
        }}
      />
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}
      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
