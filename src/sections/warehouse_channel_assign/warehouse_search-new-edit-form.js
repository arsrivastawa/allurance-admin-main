import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import { Checkbox, FormControl, FormControlLabel, FormLabel, InputLabel, Radio, RadioGroup, Select, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

import { FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader, fetchDataFromApi } from '../../utils/commonFunction';
import { PACKERS_CARTONS_LIST_IN_WAREHOUSE_ENDPOINT, WAREHOUSE_ENDPOINT, CHANNEL_DETAILS_ENDPOINT, CHANNEL_ASSIGN_ENDPOINT, RACKS_BOXES_DETAILSENDPOINT } from '../../utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const [selectedCartons, setSelectedCartons] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [allCartons, setAllCartons] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [allCartonsChecked, setAllCartonsChecked] = useState(false);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    cartons: Yup.array().min(1, 'At least one carton must be selected').required('Cartons are required'),
    channels: Yup.string().required('Channel is required'),
  });

  const defaultValues = useMemo(
    () => ({
      cartons: currentProduct?.cartons.map(cartonId => String(cartonId)) || [],
      channels: currentProduct?.channels[0]?.toString() || '',
    }),
    [currentProduct]
  );

  const FetchCartons = async (id) => {
    try {
      const apiUrl = id ? `${RACKS_BOXES_DETAILSENDPOINT}?id=${id}` : RACKS_BOXES_DETAILSENDPOINT;
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setAllCartons(responseData);
      }
    } catch (error) {
      console.error("Error fetching carton data:", error);
    }
  };

  const FetchChannels = async (id) => {
    try {
      const apiUrl = id ? `${CHANNEL_DETAILS_ENDPOINT}?id=${id}` : CHANNEL_DETAILS_ENDPOINT;
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setAllChannels(responseData);
      }
    } catch (error) {
      console.error("Error fetching channel data:", error);
    }
  };

  useEffect(() => {
    FetchCartons();
    FetchChannels();
  }, []);

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues
  });

  const { control, reset, handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const user = await FetchUserDetail();
      data.cartons = selectedCartons;
      data.apihitid = user.id
      const apiUrl = currentProduct ? `${CHANNEL_ASSIGN_ENDPOINT}/${currentProduct.id}` : CHANNEL_ASSIGN_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "PUT";
      // const response = await ManageAPIsData(apiUrl, fetchMethod, data);
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.channelassign.root);
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  useEffect(() => {
    if (currentProduct) {
      FetchCartons(currentProduct.id);
      FetchChannels(currentProduct.id);
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (allCartons?.length && currentProduct) {
      setSelectedCartons(currentProduct.cartons.map(cartonId => String(cartonId)) || []);
      setAllCartonsChecked(currentProduct.cartons?.length === allCartons.length);
    }
  }, [allCartons, currentProduct]);

  useEffect(() => {
    if (allChannels?.length && currentProduct) {
      setSelectedChannel(String(currentProduct.channels[0]) || '');
    }
  }, [allChannels, currentProduct]);

  const handleSelectAllCartons = (event) => {
    if (event.target.checked) {
      const allCartonIds = allCartons?.map(option => String(option.id));
      setSelectedCartons(allCartonIds);
      setAllCartonsChecked(true);
    } else {
      setSelectedCartons([]);
      setAllCartonsChecked(false);
    }
  };

  const handleSelectCartonChange = (event) => {
    const { value } = event.target;
    setSelectedCartons(value);
    setAllCartonsChecked(value.length === allCartons?.length);
  };

  const renderCartonsDropdown = () => (
    <FormControl fullWidth sx={{ marginTop: 2 }}>
      <InputLabel>Select Cartons</InputLabel>
      <Controller
        name="cartons"
        control={control}
        render={({ field }) => (
          <Select
            label="Select Cartons"
            id="cartons"
            multiple
            value={selectedCartons}
            onChange={(e) => {
              handleSelectCartonChange(e);
              field.onChange(e.target.value);
            }}
            renderValue={(selected) => {
              if (!Array.isArray(selected) || selected.length === 0) {
                return 'Cartons';
              }
              return selected
                .map((value) => {
                  const selectedCarton = allCartons?.find(
                    (option) => String(option.carton_id) === value
                  );
                  return selectedCarton ? selectedCarton.carton_title : '';
                })
                .join(', ');
            }}
          >
            <MenuItem key="all" value="all">
              <Checkbox
                checked={allCartonsChecked}
                indeterminate={
                  selectedCartons.length > 0 &&
                  selectedCartons.length < allCartons?.length
                }
                onChange={handleSelectAllCartons}
              />
              <Typography variant="body1">All</Typography>
            </MenuItem>
            {allCartons?.map((option) => (
              <MenuItem key={option.id} value={String(option.carton_id)}>
                <Checkbox checked={selectedCartons.includes(String(option.carton_id))} />
                <Typography variant="body1">{option.carton_title}</Typography>
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </FormControl>
  );

  const renderChannelsRadioGroup = () => (
    <FormControl component="fieldset" sx={{ marginTop: 2 }}>
      <FormLabel component="legend">Select Channel</FormLabel>
      <Controller
        name="channels"
        control={control}
        render={({ field }) => (
          <RadioGroup
            aria-label="channels"
            name="channel"
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              field.onChange(e.target.value);
            }}
          >
            {allChannels?.map((option) => (
              <FormControlLabel
                key={option.id}
                id={option.id}
                value={String(option.id)}
                control={<Radio />}
                label={option.name}
              />
            ))}
          </RadioGroup>
        )}
      />
    </FormControl>
  );

  const renderNormalForm = (
    <>
      <Grid item xs={12} md={12}>
        <Card sx={{ p: 3 }}>
          {renderCartonsDropdown()}
          {renderChannelsRadioGroup()}
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderNormalForm}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
