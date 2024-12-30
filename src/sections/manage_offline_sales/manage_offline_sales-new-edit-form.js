// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
} from 'src/components/hook-form';
import { FetchUserDetail, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  CATEGORY_ENDPOINT,
  MANAGE_OFFLINE_SALES_SELECT_CHANNEL,
  MANAGE_OFFLINE_SALES_SUBMIT_SELECTED_CHANNEL,
} from '../../utils/apiEndPoints';
import { MenuItem, Typography } from '@mui/material';
import Cookies from 'js-cookie';  

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [channelList, setChannerList] = useState([]);

  const NewProductSchema = Yup.object().shape({
    sales_user_id: Yup.string().required('Channel is required'),
  });

  const defaultValues = useMemo(
    () => ({
      sales_user_id: currentProduct?.sales_user_id || '',
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
      const apiUrl = `${MANAGE_OFFLINE_SALES_SUBMIT_SELECTED_CHANNEL}`;
      const fetchMethod = 'POST';
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      const responseData = await response.json();

      if (responseData.status) {
        const requestId = responseData.data[0].request_id;
        if (requestId) {
          Cookies.set('request_id', requestId, { expires: 1 }); 
        }
        enqueueSnackbar(responseData.message, { variant: 'success' });
        router.push(paths.dashboard.manage_offline_sales.step2);
      } else {
        enqueueSnackbar(responseData.message, { variant: 'error' });
      }
    } catch (error) {
      console.log(error, 'ERROR');
    }
  });

  const getChannelListingData = async () => {
    try {
      const apiUrl = MANAGE_OFFLINE_SALES_SELECT_CHANNEL;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(apiUrl, 'POST', data);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setChannerList(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  useEffect(() => {
    getChannelListingData();
  }, []);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          <Typography variant="h4" sx={{ mb: 2, ml: 3, mt: 2 }}>
            Channel List
          </Typography>
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFSelect
              fullWidth
              id="sales_user_id"
              name="sales_user_id"
              label="Select Channel"
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Channel</MenuItem>
              {channelList &&
                channelList.length > 0 &&
                channelList.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.first_name} {option.last_name}
                  </MenuItem>
                ))}
            </RHFSelect>
          </Stack>
          <Grid xs={12} md={12} sx={{ display: 'flex', justifyContent: 'right' }}>
            <LoadingButton type="submit" variant="contained" size="md" loading={isSubmitting}>
              {'Submit & Next'}
            </LoadingButton>
          </Grid>
        </Card>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
