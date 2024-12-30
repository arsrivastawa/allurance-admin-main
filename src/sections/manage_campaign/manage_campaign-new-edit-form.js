// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
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
import {
  CAMPAIGN_ENDPOINT,
  CATEGORY_ENDPOINT,
  FETCH_PRODUCT_BASED_ON_MODEL_NUMBER,
} from '../../utils/apiEndPoints';
import { Box } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [offlineChecked, setOfflineChecked] = useState(false);
  const [onlineChecked, setOnlineChecked] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [tableData, setTableData] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productData, setProductData] = useState([]);

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Title is required'),
    no_of_valid_redemptions: Yup.string().required('No of valid redemption is required'),
    min_cart_value: Yup.string().required('Minimum Cart value is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      online_channel: onlineChecked || '',
      offline_channel: offlineChecked || '',
      start_date: currentProduct?.start_date
        ? format(new Date(currentProduct.start_date), 'dd-MM-yyyy')
        : '',
      end_date: currentProduct?.end_date
        ? format(new Date(currentProduct.end_date), 'dd-MM-yyyy')
        : '',
      no_of_valid_redemptions: currentProduct?.no_of_valid_redemptions || '',
      min_cart_value: currentProduct?.min_cart_value || '',
      max_discount_value: currentProduct?.max_discount_value || '',
      unique_code_for_all_customer: currentProduct?.unique_code_for_all_customer || '',
      coupon_code: currentProduct?.coupon_code || '',
      channel_mode: currentProduct?.channel_mode || '',
      show_on_channel: currentProduct?.show_on_channel || '',
      terms_conditions: currentProduct?.terms_conditions || '',
      off_type: currentProduct?.off_type || '',
      off_type_flat: currentProduct?.off_type_flat || '',
      off_type_percentage: currentProduct?.off_type_percentage || '',
      categories: currentProduct?.categories?.map((category) => String(category.category_id)) || [],
      description: currentProduct?.description || '',
      products: currentProduct?.products?.map((category) => String(category.id)) || [],

    }),
    [currentProduct]
  );

  const pairs = [
    { value: 1, label: 'Yes' },
    { value: 2, label: 'No' },
  ];

  const ChannelMode = [
    { value: 1, label: 'Online' },
    { value: 2, label: 'Offline' },
    { value: 3, label: 'Both' },
  ];

  const Type = [
    { value: 1, label: 'Flat' },
    { value: 2, label: 'Percentage' },
  ];

  const showChannel = [
    { value: 1, label: 'Yes' },
    { value: 2, label: 'No' },
  ];

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 15;
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  };

  const {
    reset,
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();
  const uniqueCodeValue = watch('unique_code_for_all_customer', '');

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (currentProduct) {
      if (currentProduct.start_date) {
        setStartDate(new Date(currentProduct.start_date));
      }
      if (currentProduct.end_date) {
        setEndDate(new Date(currentProduct.end_date));
      }
      setCouponCode(currentProduct?.coupons[0]?.coupon_code || '');
    }
  }, [currentProduct]);

  useEffect(() => {
    if (values.off_type !== 1) setValue('off_type_flat', '');
    if (values.off_type !== 2) setValue('off_type_percentage', '');
  }, [values.off_type, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const productIds = productData.map((product) => product[0]?.id);

      const payload = {
        ...data,
        products: productIds,
        start_date: startDate ? format(new Date(startDate), 'dd-MM-yyyy') : null,
        end_date: endDate ? format(new Date(endDate), 'dd-MM-yyyy') : null,
        online_channel: onlineChecked ? 1 : 0,
        offline_channel: offlineChecked ? 1 : 0,
        categories: selectedCategories,
        off_type_flat: data.off_type === 1 ? data.off_type_flat : '',
        off_type_percentage: data.off_type === 2 ? data.off_type_percentage : '',
      };

      const apiUrl = currentProduct
        ? `${CAMPAIGN_ENDPOINT}?id=${currentProduct.id}`
        : CAMPAIGN_ENDPOINT;

      const response = await fetch(apiUrl, {
        method: currentProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.manage_campaign.root);
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  });

  const getListingDataCategory = async () => {
    try {
      const response = await ManageAPIsData(CATEGORY_ENDPOINT, 'GET');

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

  useEffect(() => {
    getListingDataCategory();
  }, []);

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
      if (currentProduct.categories) {
        const prefilledCategories = currentProduct.categories.map((category) =>
          String(category.category_id)
        );
        setSelectedCategories(prefilledCategories);
        setAllChecked(prefilledCategories.length === tableData.length);
      }
    }
  }, [currentProduct, defaultValues, reset, tableData]);

  useEffect(() => {
    if (currentProduct && currentProduct.products) {
      const mappedProducts = currentProduct.products.map((product) => [
        {
          id: product.product_id,
          name: product.product_nme,
          model_number: product.id, 
        },
      ]);
      setProductData(mappedProducts);
    }
  }, [currentProduct]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allCategoryIds = tableData.map((option) => String(option.id));
      setSelectedCategories(allCategoryIds);
      setAllChecked(true);
    } else {
      setSelectedCategories([]);
      setAllChecked(false);
    }
  };

  const handleSelectChange = (event) => {
    const { value } = event.target;
    if (value.includes('all')) {
      const allCategoryIds = tableData.map((option) => String(option.id));
      setSelectedCategories(allCategoryIds);
      setAllChecked(true);
      return;
    }
    const updatedValues = value.filter((val) => val !== 'all');
    setSelectedCategories(updatedValues);
    setAllChecked(updatedValues.length === tableData.length);
  };

  const getProductDataOnModelNumber = async () => {
    try {
      const batchNumber = watch('model_number');
  
      if (!batchNumber) {
        enqueueSnackbar('Batch number is required.', { variant: 'warning' });
        return;
      }
  
      const payload = {
        model_number: batchNumber,
      };
  
      const apiUrl = FETCH_PRODUCT_BASED_ON_MODEL_NUMBER;
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const responseData = await response.json();
  
        const newProduct = responseData?.data?.[0];
        if (!newProduct || !newProduct.model_number) {
          enqueueSnackbar('Invalid product data received.', { variant: 'error' });
          return;
        }
  
        const flattenedProductData = productData.flat();
  
        const isDuplicate = flattenedProductData.some(
          (item) => item.model_number === newProduct.model_number
        );
  
        if (!isDuplicate) {
          setProductData((prevProductData) => [...prevProductData, responseData?.data]);
          enqueueSnackbar('Product added successfully.', { variant: 'success' });
          // resetField('model_number');
        } else {
          enqueueSnackbar('This product is already added.', { variant: 'warning' });
        }
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  };
  

  const removeSerialNumber = (index) => {
    const updatedProductData = [...productData];
    updatedProductData.splice(index, 1); 
    setProductData(updatedProductData);
    enqueueSnackbar('Product removed successfully.', { variant: 'success' });
  };


  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}
          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField id="name" name="name" label="Campaign name" />
              <RHFSelect fullWidth id="channel_mode" name="channel_mode" label="Channel Mode">
                <MenuItem value="">Select Channel</MenuItem>
                {ChannelMode?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Start Date"
                    {...field}
                    format="dd/MM/yyyy"
                    value={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      field.onChange(date);
                    }}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.start_date,
                        helperText: errors.start_date?.message,
                      },
                    }}
                  />
                )}
                rules={{ required: 'Start date is required' }}
              />
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="End Date"
                    {...field}
                    format="dd/MM/yyyy"
                    value={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                      field.onChange(date);
                    }}
                    minDate={startDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.end_date,
                        helperText: errors.end_date?.message,
                      },
                    }}
                  />
                )}
                rules={{
                  required: 'Valid till date is required',
                }}
              />
              <RHFTextField
                id="no_of_valid_redemptions"
                name="no_of_valid_redemptions"
                label="Number Of Valid Redemption"
              />
              <RHFTextField id="min_cart_value" name="min_cart_value" label="Minimum Cart Value" />
              <RHFSelect
                fullWidth
                id="unique_code_for_all_customer"
                name="unique_code_for_all_customer"
                label="Unique Code For All Customer"
              >
                <MenuItem value="">Select Off Type</MenuItem>
                {pairs.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              {uniqueCodeValue === 2 && (
                <Grid container spacing={1}>
                  <Grid item xs={10}>
                    <RHFTextField
                      id="coupon_code"
                      name="coupon_code"
                      label="Code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        const newValue = e.target.value.toUpperCase();
                        setCouponCode(newValue);
                        setValue('coupon_code', newValue);
                      }}
                      fullWidth
                      inputProps={{ maxLength: 15 }}
                    />
                  </Grid>
                  <Grid item xs={2} alignItems="flex-end" spacing={1}>
                    <Button
                      style={{ padding: '12px', textAlign: 'center' }}
                      variant="contained"
                      onClick={() => {
                        const generatedCode = generateRandomCode();
                        setCouponCode(generatedCode);
                        setValue('coupon_code', generatedCode);
                      }}
                    >
                      Generate
                    </Button>
                  </Grid>
                </Grid>
              )}
              <RHFSelect
                fullWidth
                id="off_type"
                name="off_type"
                label="Off Type"
                PaperPropsSx={{ textTransform: 'capitalize' }}
              >
                <MenuItem value="">Select Off Type</MenuItem>
                {Type.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              {values.off_type === 1 && <RHFTextField name="off_type_flat" label="Flat" />}
              {values.off_type === 2 && (
                <RHFTextField name="off_type_percentage" label="Percentage" />
              )}
              <FormControl fullWidth sx={{ marginTop: 2 }}>
                <InputLabel>Select Categories</InputLabel>
                <Select
                  label="Select Categories"
                  id="categories"
                  name="categories"
                  multiple
                  value={selectedCategories}
                  onChange={handleSelectChange}
                  renderValue={(selected) => {
                    if (!Array.isArray(selected) || selected.length === 0) {
                      return 'Categories';
                    }
                    return selected
                      .map((value) => {
                        const selectedCategory = tableData.find(
                          (option) => String(option.id) === value
                        );
                        return selectedCategory ? selectedCategory.name : '';
                      })
                      .join(', ');
                  }}
                >
                  <MenuItem key="all" value="all">
                    <Checkbox
                      checked={allChecked}
                      indeterminate={
                        selectedCategories.length > 0 &&
                        selectedCategories.length < tableData.length
                      }
                      onChange={handleSelectAll}
                    />
                    <Typography variant="body1">All</Typography>
                  </MenuItem>
                  {tableData?.map((option) => (
                    <MenuItem key={option.id} value={String(option.id)}>
                      <Checkbox checked={selectedCategories.includes(String(option.id))} />
                      <Typography variant="body1">{option.name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <RHFTextField
                id="max_discount_value"
                name="max_discount_value"
                label="Maximum Discount Value"
              />
              <RHFSelect
                fullWidth
                id="show_on_channel"
                name="show_on_channel"
                label="Show On Channel"
                PaperPropsSx={{ textTransform: 'capitalize' }}
              >
                <MenuItem value="">Select Off Type</MenuItem>
                {showChannel?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <Grid container spacing={1}>
                <Grid item xs={10}>
                  <RHFTextField
                    fullWidth
                    type="text"
                    name="model_number"
                    id="model_number"
                    label="Model Number"
                  />
                </Grid>
                <Grid item xs={2} alignItems="flex-end">
                  <Button
                    sx={{ mt: 1, ml: 1 }}
                    variant="contained"
                    type="button" 
                    onClick={getProductDataOnModelNumber}
                  >
                    + Add
                  </Button>
                </Grid>
              </Grid>
              {productData.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Sr. No</strong></TableCell>
                      {/* <TableCell><strong>Model Number</strong></TableCell> */}
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell>Delete</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productData.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        {/* <TableCell>{product[0]?.model_number}</TableCell> */}
                        <TableCell>{product[0]?.name}</TableCell>
                        <TableCell>
                              <IconButton onClick={() => removeSerialNumber(index)}>
                                <Iconify
                                  icon="material-symbols:delete-sharp"
                                  style={{ color: 'red' }}
                                />
                              </IconButton>
                            </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            </Box>
            <RHFTextField
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
            />
            <RHFTextField
              id="terms_conditions"
              name="terms_conditions"
              label="Terms & Condition"
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
