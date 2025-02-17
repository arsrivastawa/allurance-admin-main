// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';
import InputAdornment from '@mui/material/InputAdornment';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import { useResponsive } from 'src/hooks/use-responsive';

// import {
//   _tags,
// } from 'src/_mock';

import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'src/components/snackbar';
// import FormProvider, {
//   RHFTextField,
//   // RHFAutocomplete,
// } from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import FormProvider, {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';

import {
  ManageAPIsData,
  ManageAPIsDataWithHeader,
  createImageOption,
  createImageOptions,
} from '../../utils/commonFunction';
import {
  CUSTOMER_ENDPOINT,
  FRONTEND_GET_BY_PINCODE,
  OTHER_PINCODES_ENDPOINT,
  OTHER_POSTOFFICE_ENDPOINT,
  OTHER_STATE_DISTRICT_E1_ENDPOINT,
  OTHER_STATE_DISTRICT_E2_ENDPOINT,
  OTHER_STATE_DISTRICT_E3_ENDPOINT,
} from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';

import { fData } from 'src/utils/format-number';
import { IMPORT } from 'stylis';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct, fetchedData }) {
  console.log(currentProduct, 'PRIDCT');
  const router = useRouter();

  const password = useBoolean();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [stateDistrictE1Options, setStateDistrictE1Options] = useState([]);
  const [stateDistrictE2Options, setStateDistrictE2Options] = useState([]);
  const [stateDistrictE3Options, setStateDistrictE3Options] = useState([]);
  const [postOfficeOptions, setPostOfficeOptions] = useState([]);
  const [avatarIDOption, setavatarIDOption] = useState(false);
  const [pincodeOptions, setPincodeOptions] = useState([]);

  const NewProductSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required'),
    phone: Yup.string()
      .required('Phone is required')
      .matches(/^\d{10}$/, 'Phone must be a 10-digit number'),
    password: currentProduct ? '' : Yup.string().required('Password is required'),
    address: Yup.string().required('Address is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    pincode: Yup.string().required('Pincode is required'),
  });

  const avatarBasePath = '/assets/images/documents/avatar/';

  const defaultValues = useMemo(
    () => ({
      first_name: currentProduct?.first_name || '',
      last_name: currentProduct?.last_name || '',
      email: currentProduct?.email || '',
      phone: currentProduct?.phone || '',
      password: '',
      address: currentProduct?.address || '',
      state: currentProduct?.state || '',
      state_id: currentProduct?.state_id || 0,
      district: currentProduct?.district || '',
      district_id: currentProduct?.district_id || 0,
      pincode: currentProduct?.pincode || '',
      avatar: currentProduct ? currentProduct.avatar : null,
      date_of_birth: currentProduct?.date_of_birth ? new Date(currentProduct.date_of_birth) : null,
      anniversary: currentProduct?.anniversary ? new Date(currentProduct.anniversary) : null,
      record_status:
        currentProduct?.record_status === 1
          ? 'active'
          : currentProduct?.record_status === 2
            ? 'banned'
            : 'active',
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
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatar', newFile, { shouldValidate: true });
      }
      setavatarIDOption(true);
    },
    [setValue]
  );

  const getPincodeListingData = async () => {
      try {
        const apiUrl = OTHER_PINCODES_ENDPOINT;
        const response = await ManageAPIsData(apiUrl, 'GET');
  
        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          return;
        }
  
        const responseData = await response.json();
  
        if (responseData.data.length) {
          setPincodeOptions(responseData.data);
          
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const getDatabyPincode = async (pincode)=>{
    
      try {
        const data1 = {
          Pincode: pincode,
        };
        const apiUrl = OTHER_POSTOFFICE_ENDPOINT;
        const response = await ManageAPIsData(apiUrl, 'POST', data1);
  
        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          return;
        }
  
        const responseData = await response.json();
  
        if (responseData.data.length) {
          setPostOfficeOptions(responseData.data);
          methods.setValue('state_id', responseData.data[0].StateId);
          methods.setValue('district_id', responseData.data[0].DistrictId);
          methods.setValue('state', responseData.data[0].StateName);
          methods.setValue('district', responseData.data[0].DistrictName);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();

      if (data && data.avatar && Object.keys(data.avatar).length) {
        if (typeof data.avatar === 'string' && data.avatar.includes(avatarBasePath)) {
          data.avatar = data.avatar.replace(avatarBasePath, '');
        }
        if (avatarIDOption) {
          data.avatar = await createImageOptions(data.avatar, 'avatar');
        }
      }
      const apiUrl = currentProduct
        ? `${CUSTOMER_ENDPOINT}?id=${currentProduct.id}`
        : CUSTOMER_ENDPOINT;
      const fetchMethod = currentProduct ? 'PUT' : 'POST';
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      data.headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.customer.root);
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

  // State District Endpoint1 - Listing data
  const getStateDistrictE1ListingData = async () => {
    try {
      const apiUrl = OTHER_STATE_DISTRICT_E1_ENDPOINT;
      const response = await ManageAPIsData(apiUrl, 'GET');

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setStateDistrictE1Options(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // State District Endpoint2 - Listing data
  const getStateDistrictE2ListingData = async (sname) => {
    try {
      const data1 = {
        StateName: sname,
      };

      const apiUrl = OTHER_STATE_DISTRICT_E2_ENDPOINT;
      const response = await ManageAPIsData(apiUrl, 'POST', data1);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setStateDistrictE2Options(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // State District Endpoint3 - Listing data
  const getStateDistrictE3ListingData = async (sname) => {
    try {
      const data1 = {
        District: sname,
      };

      const apiUrl = OTHER_STATE_DISTRICT_E3_ENDPOINT;
      const response = await ManageAPIsData(apiUrl, 'POST', data1);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setStateDistrictE3Options(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getStateDistrictE1ListingData();
    getPincodeListingData();
  }, []);

  useEffect(() => {
    if (currentProduct) {
      getStateDistrictE2ListingData(currentProduct.state_id);
      getStateDistrictE3ListingData(currentProduct.district);
    }
  }, [currentProduct, setValue]);

  const handleStateSelectionChange = (e) => {
    const selectedName = e;
    getStateDistrictE2ListingData(selectedName);
    methods.setValue('district', '');
    methods.setValue('pincode', '');
  };

  const handleDistrictSelectionChange = (e) => {
    getStateDistrictE3ListingData(e);
    methods.setValue('pincode', '');
  };

  const handlePincodeSelectionChange = (e) => {
    const selectedName = e;

    getDatabyPincode(selectedName);
    methods.setValue('pincode', selectedName);
  };

  const renderNormalForm = (
    <>
      <Grid xs={12} md={4}>
        <Card sx={{ pt: 10, pb: 5, px: 3 }}>
          {currentProduct && (
            <Label
              color={
                (currentProduct.status === 1 && 'success') ||
                (currentProduct.status === 2 && 'error') ||
                'warning'
              }
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {(currentProduct.status === 1 && 'Active') ||
                (currentProduct.status === 2 && 'In-active') ||
                (currentProduct.status === 3 && 'Deleted')}
            </Label>
          )}

          <Box sx={{ mb: 5 }}>
            <RHFUploadAvatar
              name="avatar"
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
                  Allowed *.jpeg, *.jpg, *.png, *.gif max size of {fData(3145728)}
                </Typography>
              }
            />
          </Box>

          {/* {currentProduct && (
            <FormControlLabel
              labelPlacement="start"
              control={
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value !== 'active'}
                      onChange={(event) =>
                        field.onChange(event.target.checked ? 'banned' : 'active')
                      }
                    />
                  )}
                />
              }
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Banned
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Apply disable account
                  </Typography>
                </>
              }
              sx={{ mx: 0, mb: 0, width: 1, justifyContent: 'space-between' }}
            />
          )} */}
        </Card>
      </Grid>
      <Grid xs={12} md={8}>
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
            <RHFTextField name="first_name" label="First Name" />
            <RHFTextField name="last_name" label="Last Name" />
            <RHFTextField name="email" label="Email Address" />
            <RHFTextField name="phone" label="Phone Number" inputProps={{ maxLength: 10 }} />
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
              }}
            />
            <RHFTextField name="address" label="Address" />

            <RHFAutocomplete
              id="state"
              name="state"
              label="State"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={postOfficeOptions.map((option) => ({
                StateName: option.StateName,
                value: option.StateId,
              }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.StateName : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={
                postOfficeOptions.find(
                  (option) => option.StateId === methods.watch('state_id')
                ) || null
              }
              onChange={(e, value) => {
                handleStateSelectionChange(value ? value.value : '');
                methods.setValue('state', value ? value.StateName : '');
                methods.setValue('state_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value}
            />

            <RHFAutocomplete
              id="district"
              name="district"
              label="District"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={postOfficeOptions.map((option) => ({
                District: option.DistrictName,
                value: option.DistrictId,
              }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.DistrictName : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={
                postOfficeOptions.find(
                  (option) => option.DistrictId === methods.watch('district_id')
                ) || null
              }
              onChange={(e, value) => {
                handleDistrictSelectionChange(value ? value.District : '');
                methods.setValue('district', value ? value.District : '');
                methods.setValue('district_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value}
            />

            <RHFAutocomplete
              id="pincode"
              name="pincode"
              label="Pincode"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={pincodeOptions.map((option) => ({
                Pincode: option.Pincode,
                value: option.Pincode,
              }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.Pincode : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.Pincode : '')}
              value={
                pincodeOptions.find((option) => option.Pincode === methods.watch('pincode')) ||
                null
              }
              onChange={(e, value) => {
                handlePincodeSelectionChange(value ? value.Pincode : '');
                methods.setValue('pincode', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />

            <Controller
              name="date_of_birth"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Date of Birth"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="anniversary"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Anniversary"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
          </Box>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {/* {mdUp && <Grid md={4} />} */}
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
