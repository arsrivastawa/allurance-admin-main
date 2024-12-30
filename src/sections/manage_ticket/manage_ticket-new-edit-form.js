// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { ManageAPIsData } from '../../utils/commonFunction';
import { MANAGE_TICKET, MANAGE_TICKET_SUBJECT, MANAGE_TICKET_USER } from '../../utils/apiEndPoints';
import { MenuItem } from '@mui/material';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    user_id: Yup.string().required('User Name is required'),
    subject_id: Yup.string().required('Subject is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      user_id: currentProduct?.user_id || '',
      subject_id: currentProduct?.subject_id || '',
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
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const apiUrl = currentProduct ? `${MANAGE_TICKET}?id=${currentProduct.id}` : MANAGE_TICKET;
      const fetchMethod = currentProduct ? 'PUT' : 'POST';
      const response = await fetch(apiUrl, {
        method: fetchMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.manage_ticket.root);
      } else {
        const responseData = await response.json();
        console.error('Error from server:', responseData.error);
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  const getListingData = async () => {
    try {
      const response = await ManageAPIsData(MANAGE_TICKET_USER, 'POST');

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getSubjectData = async () => {
    try {
      const response = await ManageAPIsData(MANAGE_TICKET_SUBJECT, 'GET');

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setSubjectData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getListingData();
    getSubjectData();
  }, []);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField id="title" name="title" label="Title" />

            <RHFSelect fullWidth id="subject_id" name="subject_id" label="Subject Name">
              <MenuItem value="">Select Subject</MenuItem>
              {subjectData.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.title}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect fullWidth id="user_id" name="user_id" label="User Name">
              <MenuItem value="">Select User</MenuItem>
              {tableData.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.first_name} {option.last_name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
    </>
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
