import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFEditor,
  RHFSelect,
  RHFTextField,
  RHFUpload,
} from 'src/components/hook-form';
import { ADVERTISEMENT_MAIN_HEADING, assetsPath } from 'src/utils/apiendpoints';
import {
  AdvertisementType,
  CheckAds,
  CreateAdvertisement,
  ExclusiveType,
  UpdateAdvertisement,
} from 'src/api/advertisement';
import { UsegetCompanyCategories } from 'src/api/companycategory';
import axios from 'axios';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { DatePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentAdvertisement }) {
  const advertisemnts = Array.isArray(currentAdvertisement)
    ? currentAdvertisement[0]
    : currentAdvertisement;
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTableData] = useState([]);
  const [subHeadings, setSubHeadings] = useState([]);
  const [adsResponse, setAdsResponse] = useState({});
  const { products: propertyTypes, productsLoading: propertyTypesLoading } =
    UsegetCompanyCategories();

  const fetchLaptopimages = advertisemnts?.laptop_image
    ? `${advertisemnts.laptop_image}`
    : '';

  const fetchIpadimages = advertisemnts?.tablet_image
    ? `${advertisemnts.tablet_image}`
    : '';

  const fetchmobileimages = advertisemnts?.mobile_image
    ? `${advertisemnts.mobile_image}`
    : '';

  const NewClientSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    url: Yup.string().url('Invalid URL format').required('Url is required'),
    company_name: Yup.string().required('Company name is required'),
    company_category: Yup.string().required('Company category is required'),
    laptop_image: Yup.mixed().nullable().required('Laptop image is required'),
    tablet_image: Yup.mixed().nullable().required('Tablet image is required'),
    mobile_image: Yup.mixed().nullable().required('Mobile image is required'),
    start_date: Yup.string()
      .required('Start date is required')
      .test('is-valid-date', 'Start date is not valid', (value) => !isNaN(Date.parse(value))),
    end_date: Yup.string()
      .required('End date is required')
      .test('is-valid-date', 'End date is not valid', (value) => !isNaN(Date.parse(value)))
      .test('is-after-start', 'End date must be after start date', function (value) {
        const { start_date } = this.parent;
        return !value || !start_date || new Date(value) > new Date(start_date);
      }),
  });

  const defaultValues = useMemo(
    () => ({
      title: advertisemnts?.title || '',
      url: advertisemnts?.url || '',
      company_name: advertisemnts?.company_name || '',
      company_category: advertisemnts?.company_category || '',
      main_heading: advertisemnts?.main_heading || '',
      type: 2,
      sub_heading: advertisemnts?.sub_heading || '',
      description: advertisemnts?.description || '',
      laptop_image: fetchLaptopimages || null,
      tablet_image: fetchIpadimages || null,
      mobile_image: fetchmobileimages || null,
      start_date: advertisemnts?.start_date
        ? format(new Date(advertisemnts.start_date), "yyyy-MM-dd'T'HH:mm")
        : '',
      end_date: advertisemnts?.end_date
        ? format(new Date(advertisemnts.end_date), "yyyy-MM-dd'T'HH:mm")
        : '',
    }),
    [advertisemnts]
  );

  const methods = useForm({
    resolver: yupResolver(NewClientSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    watch,
    control,
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({
        main_heading: '',
        sub_heading: '',
      });
    }
  }, [fields.length]);

  const handleRemove = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const values = watch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ADVERTISEMENT_MAIN_HEADING);
        setTableData(response?.data?.data);
      } catch (err) {
        console.log(err);
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  const handleSubheading = useCallback(
    async (id, index) => {
      if (!id) {
        resetField(`items.${index}.sub_heading`, { defaultValue: '' });
        setSubHeadings((prev) => {
          const updated = [...prev];
          updated[index] = [];
          return updated;
        });
        return;
      }

      try {
        if ([8, 9, 10].includes(Number(id))) {
          const response = await axios.get(`${ADVERTISEMENT_MAIN_HEADING}?id=${id}`);
          setSubHeadings((prev) => {
            const updated = [...prev];
            if (JSON.stringify(updated[index]) !== JSON.stringify(response?.data?.data)) {
              updated[index] = response?.data?.data || [];
            }
            return updated;
          });
        } else {
          resetField(`items.${index}.sub_heading`, { defaultValue: '' });
          setSubHeadings((prev) => {
            const updated = [...prev];
            updated[index] = [];
            return updated;
          });
        }
      } catch (error) {
        enqueueSnackbar('Failed to load subheadings', { variant: 'error' });
      }
    },
    [enqueueSnackbar, resetField]
  );

  useEffect(() => {
    values?.items?.forEach((item, index) => {
      handleSubheading(item.main_heading, index);
    });
  }, [values.items, handleSubheading]);

  useEffect(() => {
    if (!values.main_heading || ![8, 9, 10].includes(Number(values.main_heading))) {
      resetField('sub_heading');
      setSubHeadings([]);
    }
  }, [values.main_heading, resetField]);

  useEffect(() => {
    handleSubheading();
  }, []);

  useEffect(() => {
    reset(defaultValues);
  }, [advertisemnts, reset, defaultValues]);

  useEffect(() => {
    if (advertisemnts?.ads_records?.length) {
      reset({
        ...defaultValues,
        items: advertisemnts?.ads_records?.map((record) => ({
          main_heading: record?.ads_main_id,
          sub_heading: record?.ads_submain_id,
        })),
      });
    }
  }, [advertisemnts, reset, append, defaultValues]);

  const handleAdsCheck = async (index) => {
    try {
      const selectedItem = values.items[index];

      const payload = {
        main_heading: selectedItem?.main_heading,
        sub_heading: selectedItem?.sub_heading,
        start_date: values?.start_date,
        end_date: values?.end_date,
      };

      const response = await CheckAds(payload);
      if (response?.status) {
        const runningAds = response?.data?.[1]?.running || [];
        setAdsResponse((prev) => ({
          ...prev,
          [index]: runningAds?.map((ad) => ({
            title: ad.title,
            start_date: ad.start_date,
            end_date: ad.end_date,
            company_name: ad.company_name,
          })),
        }));
        append({
          main_heading: '',
          sub_heading: '',
        });
      } else {
        enqueueSnackbar(response?.data?.error || 'Unknown error', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Unknown error', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data, index) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'laptop_image' && value[0]) {
          formData.append(key, value[0]);
        } else if (key === 'tablet_image' && value[0]) {
          formData.append(key, value[0]);
        } else if (key === 'mobile_image' && value[0]) {
          formData.append(key, value[0]);
        } else if (key === 'items') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      if (advertisemnts) {
        await UpdateAdvertisement(advertisemnts.id, formData);
        enqueueSnackbar('Advertisement updated successfully!', { variant: 'success' });
      } else {
        await CreateAdvertisement(formData);
        enqueueSnackbar('Advertisement created successfully!', { variant: 'success' });
      }
      router.push(paths.dashboard.advertisement.list);
      reset();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Unknown error', { variant: 'error' });
    }
  });

  const handleLaptopDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('laptop_image', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveLaptopFile = useCallback(() => {
    setValue('laptop_image', null);
  }, [setValue]);

  const handleIpadDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('tablet_image', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveIpadFile = useCallback(() => {
    setValue('tablet_image', null);
  }, [setValue]);

  const handleMobileDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('mobile_image', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveMobileFile = useCallback(() => {
    setValue('mobile_image', null);
  }, [setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
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
              <RHFTextField name="title" label="Title" />
              <RHFTextField name="url" label="URL" />
              <RHFTextField name="company_name" label="Company name" />
              <FormControl fullWidth>
                <InputLabel>Company category name</InputLabel>
                <Controller
                  name="company_category"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        {...field}
                        label="Company category name"
                        error={!!fieldState.error}
                        disabled={propertyTypesLoading}
                      >
                        {propertyTypesLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={24} />
                          </MenuItem>
                        ) : (
                          propertyTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.title}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText style={{ color: '#FF5630' }}>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </>
                  )}
                />
              </FormControl>
              {/* <RHFTextField
                type="datetime-local"
                name="start_date"
                label="Start date"
                InputLabelProps={{ shrink: true }}
              /> */}
              <Controller
                name="start_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Start date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? format(new Date(newValue), 'yyyy-MM-dd') : null);
                    }}
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
              {/* <RHFTextField
                type="datetime-local"
                name="end_date"
                label="End date"
                InputLabelProps={{ shrink: true }}
              /> */}
              <Controller
                name="end_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="End date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? format(new Date(newValue), 'yyyy-MM-dd') : null);
                    }}
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Stack spacing={3} sx={{ mt: 3 }}>
                <Typography variant="subtitle2">Description</Typography>
                <RHFEditor name="description" />
              </Stack>
              <Box
                sx={{
                  mt: 3,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <RHFUpload
                    name="laptop_image"
                    maxSize={3145728}
                    onDrop={handleLaptopDrop}
                    onDelete={handleRemoveLaptopFile}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> Image must be in 1296 x 180 pixels
                    <br /> max size of 3MB
                  </Typography>
                </Box>
                <Box>
                  <RHFUpload
                    name="tablet_image"
                    maxSize={3145728}
                    onDrop={handleIpadDrop}
                    onDelete={handleRemoveIpadFile}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> Image must be in 250 x 350 pixels
                    <br /> max size of 3MB
                  </Typography>
                </Box>
                <Box>
                  <RHFUpload
                    name="mobile_image"
                    maxSize={3145728}
                    onDrop={handleMobileDrop}
                    onDelete={handleRemoveMobileFile}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> Image must be in 350 x 350 pixels
                    <br /> max size of 3MB
                  </Typography>
                </Box>
              </Box>

              <>
                {fields?.map((item, index) => (
                  <Box
                    key={item?.id || index}
                    sx={{
                      mt: 3,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(12, 1fr)',
                      gap: 4,
                      alignItems: 'center',
                    }}
                  >
                    <Box gridColumn={{ xs: 'span 12', md: 'span 4' }}>
                      <RHFSelect
                        fullWidth
                        id={`items.${index}.main_heading`}
                        name={`items.${index}.main_heading`}
                        label="Main Heading"
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setValue(`items.${index}.main_heading`, selectedId || '', {
                            shouldValidate: true,
                          });
                          handleSubheading(selectedId, index);
                        }}
                      >
                        <MenuItem value="">Select Main Heading</MenuItem>
                        {tableData?.map((option) => (
                          <MenuItem key={option?.id} value={option?.id}>
                            {option?.title}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Box>
                    <Box gridColumn={{ xs: 'span 12', md: 'span 4' }}>
                      <RHFSelect
                        fullWidth
                        label="Sub Heading"
                        id={`items.${index}.sub_heading`}
                        name={`items.${index}.sub_heading`}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setValue(`items.${index}.sub_heading`, selectedId || '', {
                            shouldValidate: true,
                          });
                        }}
                      >
                        <MenuItem value="">Select Sub Heading</MenuItem>
                        {subHeadings[index]?.map((option) => (
                          <MenuItem key={option?.id} value={option?.id}>
                            {option?.title}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Box>
                    <Box
                      gridColumn={{
                        xs: 'span 12',
                        md: 'span 4',
                      }}
                    >
                      <LoadingButton
                        variant="contained"
                        size="small"
                        loading={isSubmitting}
                        onClick={() => handleAdsCheck(index)}
                      >
                        {'Check & process '}
                      </LoadingButton>
                      {fields.length > 1 && (
                        <Button
                          size="small"
                          title="Remove"
                          color="error"
                          onClick={() => handleRemove(index)}
                          sx={{ flexShrink: 0, ml: 2 }}
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                        ></Button>
                      )}
                    </Box>
                    {adsResponse[index]?.length > 0 && (
                      <Box gridColumn={{ xs: 'span 12', md: 'span 4' }}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          {adsResponse[index].map((ad, i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {`Title: ${ad?.title}`}
                              </Typography>
                              <Typography variant="body2">
                                {`Start Date: ${new Date(ad?.start_date).toLocaleDateString()}`}
                              </Typography>
                              <Typography variant="body2">
                                {`End Date: ${new Date(ad?.end_date).toLocaleDateString()}`}
                              </Typography>
                              <Typography variant="subtitle2">
                                {`Comapny name: ${ad?.company_name}`}
                              </Typography>
                            </Box>
                          ))}
                        </Card>
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!advertisemnts ? 'Create' : 'Update'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  advertisemnts: PropTypes.object,
};
