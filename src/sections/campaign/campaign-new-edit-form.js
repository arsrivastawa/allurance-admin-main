import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Image from 'src/components/image';
import { fDate } from 'src/utils/format-time';
const governmentBasePath = '../assets/images/documents/government/';
import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
  RHFRadioGroup,
} from 'src/components/hook-form';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Checkbox, Chip, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { CAMPAIGN_ENDPOINT, CATEGORY_ENDPOINT, FETCH_PRODUCTS_BY_CATEGORY, MARKETING_ENDPOINT } from 'src/utils/apiEndPoints';
import { FetchUserDetail, ManageAPIsData, createImageOption, fetchDataFromApi } from 'src/utils/commonFunction';
import { useSnackbar } from 'src/components/snackbar';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { useRouter } from 'src/routes/hooks';
import { DatePicker } from '@mui/x-date-pickers';
import { JOB_EMPLOYMENT_TYPE_OPTIONS } from 'src/_mock';
import { paths } from 'src/routes/paths';
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

export default function ProductNewEditForm({ invoice }) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [stateCategoryOptions, setCategoryOptions] = useState([]);
  const [ProductsOptions, setProductOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [allChecked, setAllChecked] = useState(false);
  const [offlineChecked, setOfflineChecked] = useState(false);
  const [onlineChecked, setOnlineChecked] = useState(false);
  const [generatedURL, setGeneratedURL] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const fetchProductsForSelectedCategories = async () => {
      const products = await fetchProducts(selectedValues);
      setProductOptions(products);
    };
    if (invoice) {
      // Parse categories and products strings into arrays
      const categoriesArray = invoice.categories.split(',').map(item => parseInt(item));
      const productsArray = invoice.products.split(',').map(item => parseInt(item));

      setSelectedValues(categoriesArray);
      setSelectedProducts(productsArray);
      fetchProductsForSelectedCategories(categoriesArray);
    }
  }, [invoice]);

  useEffect(() => {
    invoice?.online_channel == 1 ? setOnlineChecked(true) : '';
    invoice?.offline_channel == 1 ? setOfflineChecked(true) : '';
    invoice?.coupon_code ? setCouponCode(invoice?.coupon_code) : '';
    invoice?.start_date ? setStartDate(new Date(invoice.start_date)) : '';
    invoice?.till_date ? setEndDate(new Date(invoice.till_date)) : '';
    // Check if invoice exists
    if (invoice) {
      // Set generatedURL to invoice.campaign_url if invoice exists
      setGeneratedURL(invoice.campaign_url);
    } else {
      // Otherwise, generate a random URL
      const generateCampaignURL = async () => {
        const randomString = await generateRandomAlphaNumeric(6); // Change the length as needed
        setValue("campaign_url", `https://allurance.co/campaign/${randomString}`)
        // return `https://allurance.co/campaign/${randomString}`;
      };

      const fetchGeneratedURL = async () => {
        const url = await generateCampaignURL();
        setGeneratedURL(url);
      };

      fetchGeneratedURL();
    }
  }, [invoice]);

  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    // campaign_name: Yup.string().required('Campaign name is required'),
    // number_of_redemptions: Yup.string().required('Redemption numbers Price is required'),
    // number_of_redemptions_single_user: Yup.string().required('Bulk Price is required'),
    // min_cart_value: Yup.string().required('Minimun cart price Price is required'),
    // min_cart_products: Yup.string().required('Minimun cart price Price is required'),
    // max_discount_in_price: Yup.string().required('Max discount price Price is required'),
    // products: Yup.string().required('Max discount price Price is required'),
    // campaign_url: Yup.string().required('Campaign URL is required'),
    // discount_percentage: Yup.number()
    //   .typeError('Must be a number')
    //   .required('Discount is required')
    //   .max(100, 'Discount must be less than or equal to 100')
    // bulk_price: Yup.string().required('Bulk Price is required'),
  });

  const defaultValues = useMemo(
    () => ({
      campaign_name: invoice?.campaign_name || '',
      start_date: invoice?.start_date || '', // Provide a default value for start_date
      till_date: invoice?.till_date || '', // Provide a default value for till_date
      number_of_redemptions: invoice?.number_of_redemptions || '',
      number_of_redemptions_single_user: invoice?.number_of_redemptions_single_user || '',
      discount_percentage: invoice?.discount_percentage || '',
      min_cart_value: invoice?.min_cart_value || '',
      min_cart_products: invoice?.min_cart_products || '',
      max_discount_in_price: invoice?.max_discount_in_price || '',
      // categories: invoice?.categories || '',
      // products: invoice?.products || '',
      show_in_section: invoice?.show_in_section || '',
      first_order_validity: invoice?.first_order_validity || '',
      campaign_url: invoice?.campaign_url || '', // Provide a default value for campaign_url
      coupon_code: invoice?.coupon_code || '',
      description: invoice?.description || '',
    }),
    [invoice]
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
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  useEffect(() => {
    dropdownCategory();
    if (invoice) {
      reset(defaultValues);
    }
  }, [invoice, defaultValues, reset]);



  const onSubmit = handleSubmit(async (data) => {
    try {
      data.categories = selectedValues;
      data.products = selectedProducts;
      data.coupon_code = couponCode
      data.online_channel = onlineChecked
      data.offline_channel = offlineChecked
      const generatedTerms = await generateTermsAndConditions(data);
      setTermsAndConditions(generatedTerms);
      const user = await FetchUserDetail();
      data.apihitid = user.id
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      const apiUrl = invoice ? `${CAMPAIGN_ENDPOINT}?id=${invoice.id}` : CAMPAIGN_ENDPOINT;
      const fetchMethod = invoice ? "PUT" : "POST";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar(invoice ? 'Update Success' : 'Create success!');
        router.push(paths.dashboard.campaign.root);
      } else {
        const responseData = await response.json();
        // Check if the response contains an error message
        if (responseData && responseData.error) {
          // Display the error message to the user, for example, using a notification library
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  });

  // Category List - Dropdown
  const dropdownCategory = async () => {
    const apiUrl = CATEGORY_ENDPOINT;
    const responseData = await fetchDataFromApi(apiUrl, 'GET');
    if (responseData) {
      setCategoryOptions(responseData);
    }
  };


  const APPLYCOUPONCODE = [
    { value: 2, label: 'Yes' },
    { value: 1, label: 'No' },
  ];

  const VALIDFORFIRSTORDER = [
    { value: 2, label: 'Yes' },
    { value: 1, label: 'No' },
  ];

  const numberOptions = [
    { value: 1, label: 'One' },
    { value: 2, label: 'Two' },
    { value: 3, label: 'Three' },
    { value: 4, label: 'Four' },
    { value: 5, label: 'Five' },
    { value: 6, label: 'Six' },
    { value: 7, label: 'Seven' },
    { value: 8, label: 'Eight' },
    { value: 9, label: 'Nine' },
    { value: 10, label: 'Ten' },
  ];


  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 15;
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    setCouponCode(code);
  };

  // Static options for the select input
  const staticOptions = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

  const generateTermsAndConditions = (formData) => {
    const {
      startDate,
      expiredDate,
      number_of_redemptions,
      number_of_redemptions_single_user,
      minimum_cart_value,
      minimum_products_in_cart,
      max_discount_in_price,
      discount_percentage,
      campaign_url,
      description,
    } = formData;

    // Format dates
    const formattedStartDate = fDate(startDate);
    const formattedExpiredDate = fDate(expiredDate);

    // Format numerical values
    const formattedMinimumCartValue = parseFloat(minimum_cart_value).toFixed(2);
    const formattedMaximumDiscount = parseFloat(max_discount_in_price).toFixed(2);

    let termsAndConditions = "";
    termsAndConditions += `Offer Terms and Conditions for Customers*\n\n`;
    termsAndConditions += `This promotion is valid from ${formattedStartDate} till ${formattedExpiredDate}.\n`;
    termsAndConditions += `One user can use this promotion ${number_of_redemptions_single_user} times during its validity period.\n`;
    termsAndConditions += `To avail this promotion, your cart should have a minimum of ${minimum_products_in_cart} applicable products with a total value of ₹${formattedMinimumCartValue}.\n`;
    termsAndConditions += `This promotion is applicable on all products.\n`;
    termsAndConditions += `With this promotion, you can avail ₹${formattedMaximumDiscount} off.\n`;
    termsAndConditions += `This promotion is applicable on all products available at ${campaign_url}.\n`;
    termsAndConditions += `Description: ${description}\n`;
    termsAndConditions += `\n\nThe Standard Terms & Conditions and Privacy Policy of Allurance Private Limited also apply.`;

    // Add more conditions as per your requirement
    return termsAndConditions;
  };


  const handleOfflineChange = (event) => {
    setOfflineChecked(event.target.checked);
  };

  const handleOnlineChange = (event) => {
    setOnlineChecked(event.target.checked);
  };


  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // If "All" is checked, set selectedValues to contain all category IDs
      const allCategoryIds = stateCategoryOptions?.map(option => option.id);
      setSelectedValues(allCategoryIds);
      fetchProducts(allCategoryIds);
    } else {
      // If "All" is unchecked, clear selectedValues
      setSelectedValues([]);

    }
  };


  const fetchProducts = async (categoryIds) => {
    try {
      const apiUrl = FETCH_PRODUCTS_BY_CATEGORY + `?categories=${categoryIds.join(',')}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        // setProductOptions(data.data)
        return data.data;
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // const handleSelectChangeCategory = async (event) => {
  //   const { value } = event.target;
  //   // If "All" is selected, select all other options
  //   if (value.includes("all")) {
  //     const allCategoryIds = stateCategoryOptions.map(option => option.id);
  //     setSelectedValues(allCategoryIds);
  //     setAllChecked(true);
  //     return;
  //   }
  //   // Remove "All" if it's present in the selected values
  //   const updatedValues = value.filter(val => val !== "all");
  //   // Update selected values
  //   setSelectedValues(updatedValues);
  //   // Check if all individual options are selected
  //   const allChecked = updatedValues.length === stateCategoryOptions.length;
  //   // Update the "All" checkbox state based on the selection
  //   const products = await fetchProducts(updatedValues);
  //   setProductOptions(products);
  //   setAllChecked(allChecked);
  // };

  const handleSelectChangeCategory = async (event) => {
    const { value } = event.target;
    // If "All" is selected, select all other options
    if (value.includes("all")) {
      const allCategoryIds = stateCategoryOptions.map(option => option.id);
      setSelectedValues(allCategoryIds);
      setAllChecked(true);
      return;
    }
    // Remove "All" if it's present in the selected values
    const updatedValues = value.filter(val => val !== "all");
    // Update selected values
    setSelectedValues(updatedValues);
    // Check if all individual options are selected
    const allChecked = updatedValues.length === stateCategoryOptions.length;
    // Update the "All" checkbox state based on the selection
    const products = await fetchProducts(updatedValues);
    setProductOptions(products);
    setAllChecked(allChecked);
  };

  const handleSelectChangeProducts = (event) => {
    const { value } = event.target;
    // Update selected products state
    setSelectedProducts(value);
  };

  const generateRandomAlphaNumeric = async (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  };

  const handleSelectAllProducts = (event) => {
    if (event.target.checked) {
      // If "All" is checked, set selectedProducts to contain all product IDs
      const allProductIds = ProductsOptions?.map(product => product?.id);
      setSelectedProducts(allProductIds);
    } else {
      // If "All" is unchecked, clear selectedProducts
      setSelectedProducts([]);
    }
  };

  return (
    <>
      <Card sx={{ pt: 5, px: 5, py: 5 }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Typography variant="subtitle1" >Campaign basic details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <RHFTextField id="campaign_name" name="campaign_name" label="Campaign name" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle2">Applicable channel :-</Typography>
                  <FormControlLabel
                    control={<Checkbox checked={offlineChecked} onChange={handleOfflineChange} />}
                    label="Offline"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={onlineChecked} onChange={handleOnlineChange} />}
                    label="Online"
                  />
                </Stack>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Stack spacing={1.5}>
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker

                        label="Campaign start date"
                        {...field}
                        format="dd/MM/yyyy"
                        onChange={(date) => {
                          setStartDate(date);
                          field.onChange(date);
                        }}
                        value={startDate}
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message,
                          },
                        }}
                      />
                    )}
                    rules={{ required: "Start date is required" }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1.5}>
                  <Controller
                    name="till_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Campaign valid till"
                        {...field}
                        format="dd/MM/yyyy"
                        minDate={startDate}
                        value={endDate}
                        onChange={(date) => {
                          setEndDate(date);
                          field.onChange(date);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.expiredDate,
                            helperText: errors.expiredDate?.message,
                          },
                        }}
                      />
                    )}
                    rules={{
                      required: "Valid till date is required",
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
            <Typography variant="subtitle1" >Discount & Redemption details</Typography>
            <Grid container spacing={3} >
              <Grid item xs={6}>
                <RHFTextField id="number_of_redemptions" name="number_of_redemptions" label="Number of redemptions" type="number" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <RHFAutocomplete
                  id="number_of_redemptions_single_user"
                  name="number_of_redemptions_single_user"
                  label="Number of redemptions by a single user"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  options={numberOptions}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value} // Update this line
                  value={numberOptions.find((option) => option.value === methods.watch('number_of_redemptions_single_user')) || null}
                  onChange={(e, value) => {
                    methods.setValue('number_of_redemptions_single_user', value ? value.value : '');
                  }}
                  isOptionEqualToValue={(option, value) => option.value === value}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3} >
              <Grid item xs={6}>
                <RHFTextField id="discount_percentage" name="discount_percentage" label="Discount ( in % )" type="number" rows={4} fullWidth
                  error={!!errors.discount_percentage}
                  helperText={errors.discount_percentage?.message}
                />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField id="min_cart_value" name="min_cart_value" label="Minimum cart value" type="number" rows={4} fullWidth />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <RHFTextField id="min_cart_products" name="min_cart_products" label="Minimum cart products" type="number" rows={4} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField id="max_discount_in_price" name="max_discount_in_price" label="Maximum discount ( in ₹ )" type="number" rows={4} fullWidth />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Category & Product selection</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select category</InputLabel>
                  <Select
                    label="Select Category"
                    id="categories"
                    name="categories"
                    multiple
                    value={Array.isArray(selectedValues) ? selectedValues : []}
                    onChange={handleSelectChangeCategory}
                    input={<OutlinedInput label="Select Category" />}
                    renderValue={(selected) => {
                      if (!Array.isArray(selected)) {
                        // If selected is not an array, return a default value
                        return 'Select Category';
                      }

                      if (selected.length === 0) {
                        return 'Select Category';
                      }

                      if (selected.length === stateCategoryOptions.length) {
                        // Map every element if all categories are selected
                        return stateCategoryOptions.map((option) => option.name).join(', ');
                      }

                      // Concatenate the names of selected categories
                      return selected.map((value) => stateCategoryOptions.find((option) => option.id === value)?.name).join(', ');
                    }}
                  >
                    <MenuItem key="all" value="all">
                      <Checkbox
                        checked={selectedValues?.length === stateCategoryOptions?.length}
                        indeterminate={selectedValues?.length > 0 && selectedValues?.length < stateCategoryOptions?.length}
                        onChange={(event) => handleSelectAll(event)}
                      />
                      All
                    </MenuItem>
                    {/* Render options for the parent dropdown */}
                    {stateCategoryOptions?.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <Checkbox checked={selectedValues?.includes(option.id)} />
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Select products</InputLabel>
                  <Select
                    label="Select Product"
                    id="products"
                    name="products"
                    multiple
                    value={Array.isArray(selectedProducts) ? selectedProducts : []}
                    onChange={handleSelectChangeProducts}
                    input={<OutlinedInput label="Select Product" />}
                    renderValue={(selected) => {
                      if (selected?.length === 0) {
                        return 'Select Product';
                      }
                      if (selected?.length === ProductsOptions?.length) {
                        // Map every element if all products are selected
                        return ProductsOptions?.map((option) => option.title).join(', ');
                      }

                      // Concatenate the names of selected products
                      return selected?.map((value) => ProductsOptions?.find((product) => product.id === value)?.title).join(', ');
                    }}
                  >
                    {/* Render "All" option */}
                    <MenuItem key="all" value="all">
                      <Checkbox
                        checked={selectedProducts?.length === ProductsOptions?.length}
                        onChange={handleSelectAllProducts}
                      />
                      All
                    </MenuItem>

                    {/* Render options for the child dropdown */}
                    {ProductsOptions && ProductsOptions?.length > 0 && ProductsOptions?.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        <Checkbox checked={selectedProducts?.includes(product.id)} />
                        {product.title}
                      </MenuItem>
                    ))}
                  </Select>

                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Show on apply coupon section :-</Typography>
                <RHFRadioGroup row spacing={4} name="show_in_section" options={APPLYCOUPONCODE} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Valid for first order only :-</Typography>
                <RHFRadioGroup row spacing={4} name="first_order_validity" options={VALIDFORFIRSTORDER} />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Other details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <RHFTextField
                  id="campaign_url"
                  name="campaign_url"
                  label="Campaign URL"
                  defaultValue={generatedURL} // Set the default value here
                  // InputProps={{
                  //   readOnly: true, // Make the text field read-only
                  // }}
                  rows={4}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={1} >
                  <Grid item xs={10}>
                    <RHFTextField
                      id="coupon_code"
                      name="coupon_code"
                      label="Coupon code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        setCouponCode(e.target.value);
                      }}
                      fullWidth
                      inputProps={{ maxLength: 15 }}
                    />
                  </Grid>
                  <Grid item xs={2} alignItems="flex-end" spacing={1}>
                    <Button style={{ padding: "12px", textAlign: "center" }} variant="contained" onClick={generateRandomCode}>Generate</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField id="description" name="description" label="Description" multiline rows={4} fullWidth />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting} sx={{ mt: 2 }}>
                {invoice ? "Update" : "Create"}
              </LoadingButton>
            </Grid>
          </Stack>
        </FormProvider>

        {termsAndConditions && (
          <>
            <Typography variant="h6" gutterBottom>Terms and Conditions</Typography>
            <Typography variant="body1" gutterBottom>{termsAndConditions}</Typography>
          </>
        )}
      </Card>
      {/* <Lightbox index={selectedImage} slides={[...Array(6)].map((_, index) => ({ src: invoice[`image${index + 1}`] }))} open={openLightbox} close={handleCloseLightbox} /> */}
    </>
  );
}

ProductNewEditForm.propTypes = {
  invoice: PropTypes.object.isRequired,
};