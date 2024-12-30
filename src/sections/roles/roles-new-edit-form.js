import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { createRole, updateRole } from 'src/api/roles';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const NewProductSchema = Yup.object().shape({
    role_name: Yup.string().required('Role name is required'),
    description: Yup.string().required('Description is required'),
  });

  const defaultValues = useMemo(
    () => ({
      role_name: currentProduct?.role_name || '',
      description: currentProduct?.description || '',
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;


  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentProduct) {
        await updateRole(currentProduct.id, data);
        enqueueSnackbar('Role updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.roles.root);
      } else {
        await createRole(data);
        enqueueSnackbar('Role created successfully!', { variant: 'success' });
        router.push(paths.dashboard.roles.root);
      }
      reset();
    } catch (error) {
      enqueueSnackbar((error.response?.data?.message || 'Unknown error'), { variant: 'error' });
    }
  })

  const renderDetails = (
      <Grid xs={12} md={12}>
        <Card>
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="role_name" label="Role Name" />
            <RHFTextField name="description" label="Description" multiline rows={4} />
          </Stack>  
        </Card>
      </Grid>
  );

  const renderActions = (
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'left' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Create Role' : 'Save Changes'}
        </LoadingButton>
      </Grid>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
