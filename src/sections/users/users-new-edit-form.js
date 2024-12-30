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
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'src/components/snackbar';
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
  ManageAPIsDataWithFile,
  createImageOption,
  createImageOptions,
} from '../../utils/commonFunction';
import {
  ROLE_ENDPOINT,
  USER_ENDPOINT,
  OTHER_STATE_DISTRICT_E1_ENDPOINT,
  OTHER_STATE_DISTRICT_E2_ENDPOINT,
  OTHER_STATE_DISTRICT_E3_ENDPOINT,
} from '../../utils/apiEndPoints';
import Box from '@mui/material/Box';
import { fData } from 'src/utils/format-number';
import { IMPORT } from 'stylis';
// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const password = useBoolean();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [roleOptions, setRoleOptions] = useState([]);
  const [stateDistrictE1Options, setStateDistrictE1Options] = useState([]);
  const [stateDistrictE2Options, setStateDistrictE2Options] = useState([]);
  const [stateDistrictE3Options, setStateDistrictE3Options] = useState([]);
  const [govIDOption, setgovIDOption] = useState(false);
  const [panIDOption, setpanIDOption] = useState(false);
  const [avatarIDOption, setavatarIDOption] = useState(false);

  const NewProductSchema = Yup.object().shape({
    role_id: Yup.string().required('Role ID is required'),
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

  const governmentBasePath = '/assets/images/documents/government/';
  const pancardBasePath = '/assets/images/documents/pancard/';
  const avatarBasePath = '/assets/images/documents/avatar/';

  const defaultValues = useMemo(
    () => ({
      role_id: currentProduct?.role_id || '',
      prefix_id: currentProduct?.prefix_id || '',
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
      govt_id_number: currentProduct?.govt_id_number || '',
      govt_id_upload: currentProduct?.govt_id_upload || null,
      pan_number: currentProduct?.pan_number || '',
      pan_upload: currentProduct?.pan_upload || null,
      avatar: currentProduct ? currentProduct.avatar : null,
      status: currentProduct ? currentProduct.is_banned : 1,
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

  const govthandleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('govt_id_upload', newFile, { shouldValidate: true });
      }
      setgovIDOption(true);
    },
    [setValue]
  );

  const panhandleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('pan_upload', newFile, { shouldValidate: true });
      }
      setpanIDOption(true);
    },
    [setValue]
  );

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

  const govthandleRemoveFile = useCallback(() => {
    setValue('govt_id_upload', null);
  }, [setValue]);

  const panhandleRemoveFile = useCallback(() => {
    setValue('pan_upload', null);
  }, [setValue]);

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (data && data.govt_id_upload && Object.keys(data.govt_id_upload).length) {
        if (
          typeof data.govt_id_upload === 'string' &&
          data.govt_id_upload.includes(governmentBasePath)
        ) {
          data.govt_id_upload = data.govt_id_upload.replace(governmentBasePath, '');
        }
        if (govIDOption) {
          data.govt_id_upload = await createImageOptions(data.govt_id_upload, 'govt_id_upload');
        }
      }
      if (data && data.pan_upload && Object.keys(data.pan_upload).length) {
        if (typeof data.pan_upload === 'string' && data.pan_upload.includes(pancardBasePath)) {
          data.pan_upload = data.pan_upload.replace(pancardBasePath, '');
        }
        if (panIDOption) {
          data.pan_upload = await createImageOptions(data.pan_upload, 'pan_upload');
        }
      }
      if (data && data.avatar && Object.keys(data.avatar).length) {
        if (typeof data.avatar === 'string' && data.avatar.includes(avatarBasePath)) {
          data.avatar = data.avatar.replace(avatarBasePath, '');
        }
        if (avatarIDOption) {
          data.avatar = await createImageOptions(data.avatar, 'avatar');
        }
      }

      const apiUrl = currentProduct ? `${USER_ENDPOINT}?id=${currentProduct.id}` : USER_ENDPOINT;
      const fetchMethod = currentProduct ? 'PUT' : 'POST';
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }

      const response = await ManageAPIsDataWithFile(apiUrl, fetchMethod, {
        ...data,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.users.root);
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

  // Listing data
  const getRoleListingData = async (shapeId = null) => {
    try {
      const apiUrl = shapeId ? `${ROLE_ENDPOINT}?id=${shapeId}` : ROLE_ENDPOINT;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      const data = {};
      data.headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setRoleOptions(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getRoleListingData();
    getStateDistrictE1ListingData();
  }, []);

  useEffect(() => {
    if (currentProduct) {
      getStateDistrictE2ListingData(currentProduct.state_id);
      getStateDistrictE3ListingData(currentProduct.district);
      setValue('govt_id_upload', currentProduct ? currentProduct.govt_id_upload : null);
      setValue('pan_upload', currentProduct ? currentProduct.pan_upload : null);
    }
  }, [currentProduct, setValue]);

  useEffect(() => {
    if (currentProduct && currentProduct.role_id) {
      getRoleListingData(currentProduct.role_id);
    }
  }, [currentProduct]);

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
    methods.setValue('pincode', selectedName);
  };

  const renderNormalForm = (
    <>
      <Grid xs={12} md={4}>
        <Card sx={{ pt: 10, pb: 5, px: 3 }}>
          {currentProduct && (
            <Label
              color={
                (values.status === 1 && 'success') || (values.status === 2 && 'error') || 'warning'
              }
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {(values.status === 1 && 'Active') || (values.status === 2 && 'Banned')}
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
                  {values.prefix_id}
                </Typography>
              }
            />
          </Box>
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

            <RHFAutocomplete
              id="role_id"
              name="role_id"
              label="Role"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={roleOptions.map((option) => ({ name: option.name, value: option.id }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={roleOptions.find((option) => option.id === methods.watch('role_id')) || null}
              onChange={(e, value) => {
                methods.setValue('role_id', value ? value.value : '');
              }}
            />

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
          </Box>
        </Card>
      </Grid>
    </>
  );

  const renderDocumentForm = (
    <>
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
            <RHFUpload
              name="govt_id_upload"
              maxSize={3145728}
              onDrop={govthandleDrop}
              onDelete={govthandleRemoveFile}
            />
            <RHFUpload
              name="pan_upload"
              maxSize={3145728}
              onDrop={panhandleDrop}
              onDelete={panhandleRemoveFile}
            />
            <RHFTextField name="govt_id_number" label="Government ID Number" />
            <RHFTextField name="pan_number" label="Pan Card Number" />
          </Box>
        </Card>
      </Grid>
    </>
  );

  const renderAddressForm = (
    <>
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
            <RHFTextField name="address" label="Address" />
            <RHFAutocomplete
              id="state"
              name="state"
              label="State"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateDistrictE1Options.map((option) => ({
                StateName: option.StateName,
                value: option.id,
              }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.StateName : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={
                stateDistrictE1Options.find(
                  (option) => option.StateName === methods.watch('state')
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
              options={stateDistrictE2Options.map((option) => ({
                District: option.District,
                value: option.id,
              }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.District : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={
                stateDistrictE2Options.find(
                  (option) => option.District === methods.watch('district')
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
              options={stateDistrictE3Options.map((option) => ({
                Pincode: option.Pincode,
                value: option.id,
              }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.Pincode : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={
                stateDistrictE3Options.find((option) => option.id === methods.watch('pincode')) ||
                null
              }
              onChange={(e, value) => {
                handlePincodeSelectionChange(value ? value.Pincode : '');
                methods.setValue('pincode', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />
            
          </Box>
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

        {renderDocumentForm}

        {renderAddressForm}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
