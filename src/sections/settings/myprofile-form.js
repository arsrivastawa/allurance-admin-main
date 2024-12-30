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
import { useMockedUser } from 'src/hooks/use-mocked-user';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const password = useBoolean();

  const { user } = useMockedUser();

  // const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [roleOptions, setRoleOptions] = useState([]);
  const [stateDistrictE1Options, setStateDistrictE1Options] = useState([]);
  const [stateDistrictE2Options, setStateDistrictE2Options] = useState([]);
  const [stateDistrictE3Options, setStateDistrictE3Options] = useState([]);
  const [govIDOption, setgovIDOption] = useState(false);
  const [panIDOption, setpanIDOption] = useState(false);
  const [avatarIDOption, setavatarIDOption] = useState(false);

  const [tableData, setTableData] = useState([]);

  const NewProductSchema = Yup.object().shape({
    role_id: Yup.string().required('Role ID is required'),
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required'),
    phone: Yup.string()
      .required('Phone is required')
      .matches(/^\d{10}$/, 'Phone must be a 10-digit number'),
    password: tableData ? '' : Yup.string().required('Password is required'),
    address: Yup.string().required('Address is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    pincode: Yup.string().required('Pincode is required'),
    // govt_id_upload: Yup.mixed().nullable().required('Government Document is required'),
    // pan_upload: Yup.mixed().nullable().required('Pan Document is required'),
  });

  const governmentBasePath = '/assets/images/documents/government/';
  const pancardBasePath = '/assets/images/documents/pancard/';
  const avatarBasePath = '/assets/images/documents/avatar/';

  const defaultValues = useMemo(
    () => ({
      role_id: tableData?.role_id || '',
      first_name: tableData?.first_name || '',
      last_name: tableData?.last_name || '',
      email: tableData?.email || '',
      phone: tableData?.phone || '',
      password: '',
      address: tableData?.address || '',
      state: currentProduct?.state || '',
      state_id: currentProduct?.state_id || 0,
      district: currentProduct?.district || '',
      district_id: currentProduct?.district_id || 0,
      pincode: tableData?.pincode || '',
      govt_id_number: tableData?.govt_id_number || '',
      govt_id_upload: tableData?.govt_id_upload || null,
      pan_number: tableData?.pan_number || '',
      pan_upload: tableData?.pan_upload || null,
      avatar: tableData ? tableData.avatar : null,
    }),
    [tableData]
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

  useEffect(() => {
    if (tableData) {
      reset(defaultValues);
      // console.log("RESETTING THE DEFAULT VALUE")
    }
  }, [tableData, defaultValues, reset]);

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

  const values = watch();

  useEffect(() => {
    if (tableData) {
      reset(defaultValues);
    }
  }, [tableData, defaultValues, reset]);

  // const [error, setError] = useState("");

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    const token = await sessionStorage.getItem('accessToken');
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
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
      const apiUrl = `${USER_ENDPOINT}?id=${user.id}`;
      const fetchMethod = 'PUT';
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      data.headers = { Authorization: `Bearer ${token}` };
      const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar('Update success!');
        getListingData();
        router.push(paths.dashboard.settings.myprofile);
      } else {
        const responseData = await response.json();
        // Check if the response contains an error message
        if (responseData && responseData.error) {
          // Display the error message to the user, for example, using a notification library
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  // Listing data
  const getListingData = async () => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(
        `${USER_ENDPOINT}?id=${user.id}`,
        'GET',
        data
      );
      // const response = await ManageAPIsData(`${USER_ENDPOINT}?id=${user.id}`, 'GET');

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      // if (typeof responseData === 'object' && responseData.data) {

      setTableData(responseData.data);
      // console.log("responseData.dataresponseData.data", responseData.data)
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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

  const getRoleListingData = async (shapeId = null) => {
    try {
      const apiUrl = shapeId ? `${ROLE_ENDPOINT}?id=${shapeId}` : ROLE_ENDPOINT;
      // const response = await ManageAPIsData(apiUrl, 'GET');
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      let data = {};
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
    getListingData();
    getRoleListingData(); // Fetch all shapes on component mount
    getStateDistrictE1ListingData();
  }, []);

  useEffect(() => {
    if (tableData) {
      getStateDistrictE2ListingData(tableData.state);
      getStateDistrictE3ListingData(tableData.district);
      setValue('govt_id_upload', tableData ? tableData.govt_id_upload : null);
      setValue('pan_upload', tableData ? tableData.pan_upload : null);
    }
  }, [tableData, setValue]);

  useEffect(() => {
    if (tableData && tableData.role_id) {
      getRoleListingData(tableData.role_id);
    }
  }, [tableData]);

  const handleStateSelectionChange = (e) => {
    const selectedName = e;
    // console.log("ee", e);
    methods.setValue('state', selectedName);
    getStateDistrictE2ListingData(selectedName);
    methods.setValue('district', '');
    methods.setValue('pincode', '');
  };

  useEffect(() => {
    // console.log("CHECK THE STATE CHANGE IN THE USE EFFECT",
    //   methods.watch("state"));
  }, [values.state]);

  const handleDistrictSelectionChange = (e) => {
    const selectedName = e;
    methods.setValue('district', selectedName);
    getStateDistrictE3ListingData(selectedName);
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
          <Label
            color={
              (tableData?.status === 1 && 'success') ||
              (tableData?.status === 2 && 'error') ||
              'warning'
            }
            sx={{ position: 'absolute', top: 24, right: 24 }}
          >
            {(tableData?.status === 1 && 'Active') || (tableData?.status === 2 && 'In-active')}
          </Label>

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
                  {tableData?.prefix_id}
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
            <RHFSelect
              fullWidth
              id="role_id"
              name="role_id"
              label="Role"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              disabled={true}
            >
              <MenuItem value="">Select Role</MenuItem>
              {roleOptions &&
                roleOptions.length > 0 &&
                roleOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
            </RHFSelect>
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

            {/* <RHFAutocomplete
              id="state"
              name="state"
              label="State"
              fullWidth
              options={stateDistrictE1Options?.map((option) => ({ StateName: option.StateName, value: option.id }))}
              getOptionLabel={(option) => (typeof option === 'object' ? option.StateName : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.StateName : '')}
              value={stateDistrictE1Options?.find((option) => option.StateName === methods.watch('state')) || null}
              onChange={(e, value) => {
                // console.log("value", value)
                handleStateSelectionChange(value ? value.StateName : '');
                methods.setValue('state', value ? value.StateName : '');
              }}
              isOptionEqualToValue={(option, value) => option.StateName === value} // Ensure correct comparison
            /> */}

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
              // getOptionLabel={(option) => (typeof option === 'object' ? option.StateName : '')}
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
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />

            {/* <RHFAutocomplete
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
              // getOptionLabel={(option) => (typeof option === 'object' ? option.District : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.District : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.District : '')}
              value={
                stateDistrictE2Options.find(
                  (option) => option.District === methods.watch('district')
                ) || null
              }
              onChange={(e, value) => {
                handleDistrictSelectionChange(value ? value.District : '');
                methods.setValue('district', value ? value.District : '');
              }}
              isOptionEqualToValue={(option, value) => option.District === value} // Customize the equality test
            /> */}

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
              // getOptionLabel={(option) => (typeof option === 'object' ? option.District : '')}
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
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
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
              // getOptionLabel={(option) => (typeof option === 'object' ? option.Pincode : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.Pincode : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.Pincode : '')}
              value={
                stateDistrictE3Options.find(
                  (option) => option.Pincode === methods.watch('pincode')
                ) || null
              }
              onChange={(e, value) => {
                handlePincodeSelectionChange(value ? value.Pincode : '');
                methods.setValue('pincode', value ? value.Pincode : '');
              }}
              isOptionEqualToValue={(option, value) => option.Pincode === value} // Customize the equality test
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
          {'Update'}
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
