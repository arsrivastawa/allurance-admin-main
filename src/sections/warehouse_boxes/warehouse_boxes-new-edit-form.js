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
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
  RHFSelect,
} from 'src/components/hook-form';

import {
  FetchUserDetail,
  ManageAPIsData,
  ManageAPIsDataWithHeader,
} from '../../utils/commonFunction';
import {
  CATEGORY_ENDPOINT,
  WAREHOUE_BOXES_ENDPOINT,
  WAREHOUE_RACKS_ENDPOINT,
  WAREHOUSE_ADD_NAME,
  WAREHOUSE_BOXES_PACKERS_LISTING,
} from '../../utils/apiEndPoints';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { Checkbox, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const Product = Array.isArray(currentProduct) ? currentProduct[0] : currentProduct;
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [rackOptions, setrackOptions] = useState([]);
  const [AllCartons, setAllCartons] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const NewProductSchema = Yup.object().shape({
    rack_id: Yup.string().required('Rack name is required'),
  });

  const categoriesBasePath = '/assets/images/categories/';

  const defaultValues = useMemo(
    () => ({
      rack_id: Product?.rack_id || '',
      box_id: Product?.warehouse_boxes_data_array
        ? Product.warehouse_boxes_data_array.split(',').map((item) => item.trim())
        : [],
    }),
    [Product]
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
    if (Product) {
      reset(defaultValues);
    }
  }, [Product, defaultValues, reset]);

  async function FetchDetails() {
    const STORAGE_KEY = 'accessToken';
    const user = await FetchUserDetail();
    const accessToken = await sessionStorage.getItem(STORAGE_KEY);
    const decoded = await jwtDecode(accessToken);
  }

  useEffect(() => {
    FetchDetails();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      const user = await FetchUserDetail();
      const updatedValues = inputValue.split(",").map((item) => item.trim()).filter((item, index, self) => self.indexOf(item) === index);
      data.box_id = updatedValues;
      const apiUrl = Product
        ? `${WAREHOUE_BOXES_ENDPOINT}?id=${Product.id}`
        : WAREHOUE_BOXES_ENDPOINT;
      const fetchMethod = Product ? 'PUT' : 'POST';
      const response = await fetch(apiUrl, {
        method: fetchMethod,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        enqueueSnackbar(Product ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.warehouse_boxes.root);
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

  const getrackListingData = async (rack_id = null) => {
    try {
      const apiUrl = rack_id ? `${WAREHOUE_RACKS_ENDPOINT}?id=${rack_id}` : WAREHOUE_RACKS_ENDPOINT;
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
        setrackOptions(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const FetchCartons = async (Product) => {
    let apiUrl;
    if (Product) {
      apiUrl = `${WAREHOUSE_BOXES_PACKERS_LISTING}/${Product?.warehouse_boxes_data_array}`;
    } else {
      apiUrl = WAREHOUSE_BOXES_PACKERS_LISTING;
    }

    try {
      const response = await ManageAPIsData(apiUrl, 'GET');
      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        setAllCartons(responseData?.data);
      } else {
        console.error('No permissions found in response data.');
      }
    } catch (error) {
      console.error('Error fetching carton data:', error);
    }
  };

  useEffect(() => {
    getrackListingData();
    FetchCartons(Product);
  }, [Product]);

  useEffect(() => {
    if (AllCartons?.length && Product) {
      // Prefill box_id values from warehouse_boxes_data_array during edit
      const preselectedBoxIds = Product?.warehouse_boxes_data_array
        ? Product.warehouse_boxes_data_array.split(',').map((item) => String(item.trim()))
        : [];
      setInputValue(preselectedBoxIds);
    }
  }, [AllCartons, Product]);


  const handleChange = (event) => {
    setInputValue(event.target.value); // Update input value
  };


  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFSelect
              fullWidth
              id="rack_id"
              name="rack_id"
              label="Rack name"
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Shape</MenuItem>
              {rackOptions &&
                rackOptions.length > 0 &&
                rackOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
            </RHFSelect>

            <FormControl fullWidth sx={{ marginTop: 2 }}>
              <RHFTextField
                  fullWidth
                  type="text"
                  name="box_id"
                  id="box_id"
                  label="Box ID"
                  value={inputValue}
                  onChange={handleChange}
                />
              {/* <Select
                label="Select Box"
                id="box_id"
                name="box_id"
                multiple
                value={selectedValues}
                onChange={handleSelectChange}
                renderValue={(selected) => {
                  if (!Array.isArray(selected) || selected.length === 0) {
                    return 'Box';
                  }
                  return selected
                    .map((value) => {
                      const selectedCarton = AllCartons?.find(
                        (option) => String(option.id) === value
                      );
                      return selectedCarton ? selectedCarton.request_id : '';
                    })
                    .join(', ');
                }}
              >
                <MenuItem key="all" value="all">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={
                      selectedValues.length > 0 && selectedValues.length < AllCartons?.length
                    }
                    onChange={handleSelectAll}
                  />
                  <Typography variant="body1">All</Typography>
                </MenuItem>
                {AllCartons?.map((option) => (
                  <MenuItem key={option.id} value={String(option.id)}>
                    <Checkbox checked={selectedValues.includes(String(option.id))} />
                    <Typography variant="body1">{option.request_id}</Typography>
                  </MenuItem>
                ))}
              </Select> */}
            </FormControl>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!Product ? 'Submit' : 'Update'}
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
  Product: PropTypes.object,
};
