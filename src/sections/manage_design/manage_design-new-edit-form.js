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

import { FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader, createImageOption, createImageOptions, fetchDataFromApi } from '../../utils/commonFunction';
import { CATEGORY_ENDPOINT, RESINTYPE_ENDPOINT, SHAPE_ENDPOINT, SIZEFORSHAPE_ENDPOINT, BEZELMATERIAL_ENDPOINT, BEZELCOLOR_ENDPOINT, INNERMATERIAL_ENDPOINT, FLOWER_ENDPOINT, COLORSHADE_ENDPOINT, DESIGNER_ENDPOINT } from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';


// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [stateCategoryOptions, setCategoryOptions] = useState(false);
  const [stateResinOptions, setResinOptions] = useState(false);
  const [stateShapeOptions, setShapeOptions] = useState(false);
  const [stateSizeOptions, setSizeOptions] = useState(false);
  const [stateFullSizeOptions, setFullSizeOptions] = useState(false);
  const [stateBezelMaterialOptions, setBezelMaterialOptions] = useState(false);
  const [stateBezelColorOptions, setBezelColorOptions] = useState(false);
  const [stateInnerMaterialOptions, setInnerMaterialOptions] = useState(false);
  const [stateFlowerOptions, setFlowerOptions] = useState(false);
  const [stateColorOptions, setColorOptions] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(currentProduct?.category_id || ''); // Set default value to currentProduct's category_id or an empty string

  const [stateImage1Option, setImage1Option] = useState(false);
  const [stateImage2Option, setImage2Option] = useState(false);
  const [stateImage3Option, setImage3Option] = useState(false);
  const [stateImage4Option, setImage4Option] = useState(false);
  const [stateImage5Option, setImage5Option] = useState(false);
  const [stateImage6Option, setImage6Option] = useState(false);
  const [PairDetail, SetPairDetail] = useState(false);

  const NewProductSchema = Yup.object().shape({
    category_id: Yup.string().required('Category is required'),
    // manufacturing_piece: Yup.string().required('Manufacturing Pieces is required'),
    resin_id: Yup.string().required('Resin is required'),
    shape_id: Yup.string().required('Shape is required'),
    size_id: Yup.string().required('Size is required'),
    bezel_material_id: Yup.string().required('Bezel Material is required'),
    bezel_color_id: Yup.string().required('Bezel Color is required'),
    Inner_material_id: Yup.string().required('Inner Material is required'),
    flower_id: Yup.string().required('Flower is required'),
    color_id: Yup.string().required('Color is required'),
    title: Yup.string().required('Title is required'),
    in_pair: Yup.string().required('Pair selection is required'),
  });

  const governmentBasePath = '/assets/images/documents/government/';

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      // manufacturing_piece: currentProduct?.manufacturing_piece || '',
      category_id: currentProduct?.category_id || '',
      resin_id: currentProduct?.resin_id || '',
      shape_id: currentProduct?.shape_id || '',
      size_id: currentProduct?.size_id || '',
      bezel_material_id: currentProduct?.bezel_material_id || '',
      bezel_color_id: currentProduct?.bezel_color_id || '',
      Inner_material_id: currentProduct?.Inner_material_id || '',
      flower_id: currentProduct?.flower_id || '',
      color_id: currentProduct?.color_id || '',
      image1: currentProduct?.image1 || null,
      image2: currentProduct?.image2 || null,
      image3: currentProduct?.image3 || null,
      image4: currentProduct?.image4 || null,
      image5: currentProduct?.image5 || null,
      image6: currentProduct?.image6 || null,
      in_pair: PairDetail || null,
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
  // Category List - Dropdown
  const dropdownCategory = async () => {
    const fetchMethod = 'GET'
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(CATEGORY_ENDPOINT, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setCategoryOptions(response.data); }
  };

  // Resin List - Dropdown
  const dropdownResin = async () => {
    const fetchMethod = 'GET'
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(RESINTYPE_ENDPOINT, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setResinOptions(response.data); }
  };

  // Shape List - Dropdown
  const dropdownShape = async () => {
    const fetchMethod = 'GET'
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(SHAPE_ENDPOINT, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setShapeOptions(response.data); }
  };

  // Size For Shape List - Dropdown
  const dropdownSizeForShape = async () => {
    const fetchMethod = 'GET'
    const apiUrl = SIZEFORSHAPE_ENDPOINT;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setSizeOptions(response.data); setFullSizeOptions(response.data); }
  };

  const filterSize = (shapeId) => {
    const list = Array.from(stateFullSizeOptions);
    const newList = list.filter(item => +item.shape_id === +shapeId);
    setSizeOptions([...newList])
  }

  // Bezel Material List - Dropdown
  const dropdownBezelMaterial = async () => {
    const fetchMethod = 'GET'
    const apiUrl = BEZELMATERIAL_ENDPOINT;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setBezelMaterialOptions(response.data); }
  };

  // Bezel Color List - Dropdown
  const dropdownBezelColor = async () => {
    const fetchMethod = 'GET'
    const apiUrl = BEZELCOLOR_ENDPOINT;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setBezelColorOptions(response.data); }
  };

  // Inner Material List - Dropdown
  const dropdownInnerMaterial = async () => {
    const fetchMethod = 'GET'
    const apiUrl = INNERMATERIAL_ENDPOINT;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setInnerMaterialOptions(response.data); }
  };

  // Flower List - Dropdown
  const dropdownFlower = async () => {
    const fetchMethod = 'GET'
    const apiUrl = FLOWER_ENDPOINT;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setFlowerOptions(response.data); }
  };

  // Base Color List - Dropdown
  const dropdownColor = async () => {
    const fetchMethod = 'GET'
    const apiUrl = COLORSHADE_ENDPOINT;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error("Token is undefined.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const responseData = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
    const response = await responseData.json();
    if (response) { setColorOptions(response.data); }
  };

  // CATEGORY PAIR GET 
  const handleChange = (event) => {
    const categoryId = event;

    setSelectedCategoryId(categoryId);
    HandleSearchCategory(categoryId); // Call your function here
  };

  const HandleSearchCategory = async (id) => {
    try {

      const apiUrl = CATEGORY_ENDPOINT + `?id=${id}`;
      const responseData = await fetchDataFromApi(apiUrl, 'GET', 'id');
      if (responseData && responseData.pair) {
        SetPairDetail(responseData.pair);
        setValue('in_pair', responseData.pair, { shouldValidate: true }); // Update in_pair field value
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error as needed
    }
  };

  useEffect(() => {
    // Check if there is data in currentProduct.category_id
    if (currentProduct && currentProduct.category_id) {

      // Call handleChange to update in_pair based on category ID
      handleChange(currentProduct.category_id);
    }
  }, [currentProduct]);


  useEffect(() => {
    dropdownCategory();
    dropdownResin();
    dropdownShape();
    dropdownSizeForShape();
    dropdownBezelMaterial();
    dropdownBezelColor();
    dropdownInnerMaterial();
    dropdownFlower();
    dropdownColor();

  }, [defaultValues, reset]);

  // HandleImage - While submit time
  const handleImage = async (data, imageKey, stateImageOption) => {
    const image = data[imageKey];
    if (image && Object.keys(image).length) {
      if (typeof image === 'string' && image.includes(governmentBasePath)) {
        data[imageKey] = image.replace(governmentBasePath, '');
      }
      if (stateImageOption) {
        // data[imageKey].imgData = await createImageOptions(data, imageKey);
        data[imageKey] = await createImageOptions(image);
      }
    }
  };

  // Manage Add or Update
  // const onSubmit = handleSubmit(async (data) => {
  //   try {
  //     const user = await FetchUserDetail();
  //     data.apihitid = user.id
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //     reset();

  //     // Handle Image Process
  //     const imageKeys = ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
  //     for (const imageKey of imageKeys) {
  //       await handleImage(data, imageKey, eval(`state${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}Option`));
  //     }

  //     const apiUrl = currentProduct ? `${DESIGNER_ENDPOINT}/${currentProduct.id}` : DESIGNER_ENDPOINT;
  //     const fetchMethod = currentProduct ? "PUT" : "POST";
  //     const token = await sessionStorage.getItem('accessToken');
  //     if (!token) {
  //       console.error("Token is undefined.");
  //       return;
  //     }
  //     data.headers = { Authorization: `Bearer ${token}` }
  //     const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);

  //     if (response.ok) {
  //       enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
  //       router.push(paths.dashboard.manage_design.root);
  //     } else {
  //       const responseData = await response.json();
  //       // Check if the response contains an error message
  //       if (responseData && responseData.error) {
  //         // Display the error message to the user, for example, using a notification library
  //         enqueueSnackbar(responseData.error, { variant: 'error' });
  //       }
  //     }

  //   } catch (err) {
  //     console.error(err.message);
  //   }
  // });


  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const user = await FetchUserDetail();
      data.apihitid = user.id
      const formData = new FormData();
      formData.append('title', data.title || '');
      formData.append('category_id', data.category_id);
      formData.append('resin_id', data.resin_id);
      formData.append('shape_id', data.shape_id);
      formData.append('size_id', data.size_id);
      formData.append('bezel_material_id', data.bezel_material_id);
      formData.append('bezel_color_id', data.bezel_color_id);
      formData.append('Inner_material_id', data.Inner_material_id);
      formData.append('flower_id', data.flower_id);
      formData.append('color_id', data.color_id);
      formData.append('in_pair', data.in_pair || PairDetail || null);
      formData.append('apihitid', data.apihitid || 0);

      // Append six image files
      const imageKeys = ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
      for (const imageKey of imageKeys) {
        const file = data[imageKey];
        if (file) {
          formData.append(imageKey, file); // Ensure `file` is a valid File object
        }
      }

      const apiUrl = currentProduct ? `${DESIGNER_ENDPOINT}/${currentProduct.id}` : DESIGNER_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method: fetchMethod,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.manage_design.root);
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


  // Image Handler
  const createImageHandler = (imageKey, setOption) => useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = file && Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      setValue(imageKey, newFile, { shouldValidate: true });
      setOption(true);
    },
    [setValue, setOption]
  );

  const createRemoveFileHandler = (imageKey) => useCallback(() => {
    setValue(imageKey, null);
  }, [setValue]);

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (currentProduct) {
      setValue('image1', currentProduct ? currentProduct.image1 : null);
      setValue('image2', currentProduct ? currentProduct.image2 : null);
      setValue('image3', currentProduct ? currentProduct.image3 : null);
      setValue('image4', currentProduct ? currentProduct.image4 : null);
      setValue('image5', currentProduct ? currentProduct.image5 : null);
      setValue('image6', currentProduct ? currentProduct.image6 : null);
    }
  }, [currentProduct, setValue]);
  console.log('currentProductcurrentProduct', currentProduct);
  // const [error, setError] = useState("");

  const renderNormalForm = (
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
            <RHFTextField name="title" label="Title" />
            {/* <RHFSelect
              fullWidth
              id="category_id"
              name="category_id"
              label="Category"
              value={selectedCategoryId || defaultValues.category_id}
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              onChange={(e) => handleChange(e)} // Call handleChange on change
            >
              <MenuItem value="">Select Category</MenuItem>
              {stateCategoryOptions && stateCategoryOptions.length > 0 && stateCategoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}

            <RHFAutocomplete
              id="category_id"
              name="category_id"
              label="Category"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateCategoryOptions && stateCategoryOptions.length > 0 && stateCategoryOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateCategoryOptions && stateCategoryOptions.length > 0 && stateCategoryOptions.find((option) => option.id === methods.watch('category_id')) || null}
              onChange={(e, value) => {

                handleChange(value ? value.value : '');
                methods.setValue('category_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />


            {/* <RHFSelect
              fullWidth
              id="resin_id"
              name="resin_id"
              label="Resin Type"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Resin</MenuItem>
              {stateResinOptions && stateResinOptions.length > 0 && stateResinOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}

            <RHFAutocomplete
              id="resin_id"
              name="resin_id"
              label="Resin Type"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateResinOptions && stateResinOptions.length > 0 && stateResinOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateResinOptions && stateResinOptions.length > 0 && stateResinOptions.find((option) => option.id === methods.watch('resin_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.name : '');
                methods.setValue('resin_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />
            {/* <RHFSelect
              fullWidth
              id="shape_id"
              name="shape_id"
              label="Shape"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Shape</MenuItem>
              {stateShapeOptions && stateShapeOptions.length > 0 && stateShapeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.shape}
                </MenuItem>
              ))}
            </RHFSelect> */}
            <RHFAutocomplete
              id="shape_id"
              name="shape_id"
              label="Shape"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateShapeOptions && stateShapeOptions.length > 0 && stateShapeOptions.map((option) => ({ shape: option.shape, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.shape : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.shape : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateShapeOptions && stateShapeOptions.length > 0 && stateShapeOptions.find((option) => option.id === methods.watch('shape_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.shape : '');
                methods.setValue('shape_id', value ? value.value : '');
                filterSize(value ? value.value : "")
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />
            <RHFSelect
              fullWidth
              id="size_id"
              name="size_id"
              label="Size For Shape"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              {stateSizeOptions && stateSizeOptions.length > 0 && stateSizeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.length} x {option.breadth}
                </MenuItem>
              ))}
            </RHFSelect>
            {/* <RHFSelect
              fullWidth
              id="bezel_material_id"
              name="bezel_material_id"
              label="Bezel Material"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Bezel Material</MenuItem>
              {stateBezelMaterialOptions && stateBezelMaterialOptions.length > 0 && stateBezelMaterialOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}

            <RHFAutocomplete
              id="bezel_material_id"
              name="bezel_material_id"
              label="Bezel Material"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateBezelMaterialOptions && stateBezelMaterialOptions.length > 0 && stateBezelMaterialOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateBezelMaterialOptions && stateBezelMaterialOptions.length > 0 && stateBezelMaterialOptions.find((option) => option.id === methods.watch('bezel_material_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.shape : '');
                methods.setValue('bezel_material_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />

            {/* <RHFSelect
              fullWidth
              id="bezel_color_id"
              name="bezel_color_id"
              label="Bezel Color"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Bezel Color</MenuItem>
              {stateBezelColorOptions && stateBezelColorOptions.length > 0 && stateBezelColorOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}

            <RHFAutocomplete
              id="bezel_color_id"
              name="bezel_color_id"
              label="Bezel Color"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateBezelColorOptions && stateBezelColorOptions.length > 0 && stateBezelColorOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateBezelColorOptions && stateBezelColorOptions.length > 0 && stateBezelColorOptions.find((option) => option.id === methods.watch('bezel_color_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.shape : '');
                methods.setValue('bezel_color_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />

            {/* <RHFSelect
              fullWidth
              id="Inner_material_id"
              name="Inner_material_id"
              label="Inner Material"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Inner Material</MenuItem>
              {stateInnerMaterialOptions && stateInnerMaterialOptions.length > 0 && stateInnerMaterialOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}

            <RHFAutocomplete
              id="Inner_material_id"
              name="Inner_material_id"
              label="Inner Material"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateInnerMaterialOptions && stateInnerMaterialOptions.length > 0 && stateInnerMaterialOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateInnerMaterialOptions && stateInnerMaterialOptions.length > 0 && stateInnerMaterialOptions.find((option) => option.id === methods.watch('Inner_material_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.shape : '');
                methods.setValue('Inner_material_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />
            {/* <RHFSelect
              fullWidth
              id="flower_id"
              name="flower_id"
              label="Flower"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Flower</MenuItem>
              {stateFlowerOptions && stateFlowerOptions.length > 0 && stateFlowerOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}
            <RHFAutocomplete
              id="flower_id"
              name="flower_id"
              label="Flower"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateFlowerOptions && stateFlowerOptions.length > 0 && stateFlowerOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateFlowerOptions && stateFlowerOptions.length > 0 && stateFlowerOptions.find((option) => option.id === methods.watch('flower_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.shape : '');
                methods.setValue('flower_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />
            {/* <RHFSelect
              fullWidth
              id="color_id"
              name="color_id"
              label="Base Color"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Base Color</MenuItem>
              {stateColorOptions && stateColorOptions.length > 0 && stateColorOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect> */}
            <RHFAutocomplete
              id="color_id"
              name="color_id"
              label="Base Color"
              fullWidth
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              options={stateColorOptions && stateColorOptions.length > 0 && stateColorOptions.map((option) => ({ name: option.name, value: option.id }))}
              // getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
              getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
              value={stateColorOptions && stateColorOptions.length > 0 && stateColorOptions.find((option) => option.id === methods.watch('color_id')) || null}
              onChange={(e, value) => {

                // handleChange(value ? value.shape : '');
                methods.setValue('color_id', value ? value.value : '');
              }}
              isOptionEqualToValue={(option, value) => option.value === value} // Customize the equality test
            />
            <RHFSelect
              disabled
              fullWidth
              id="in_pair"
              name="in_pair"
              label="In Pair"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              <MenuItem value="">Select Pair</MenuItem>
              <MenuItem key="yes" value="Yes">
                Yes
              </MenuItem>
              <MenuItem key="no" value="No">
                No
              </MenuItem>

            </RHFSelect>
            {/* <RHFTextField name="manufacturing_piece" label="Manufacturing Pieces" type="number" /> */}
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

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Image1</Typography>
              <RHFUpload
                name="image1"
                maxSize={3145728}
                onDrop={createImageHandler('image1', setImage1Option)}
                onDelete={createRemoveFileHandler('image1')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Image2</Typography>
              <RHFUpload
                name="image2"
                maxSize={3145728}
                onDrop={createImageHandler('image2', setImage2Option)}
                onDelete={createRemoveFileHandler('image2')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle3">Image3</Typography>
              <RHFUpload
                name="image3"
                maxSize={3145728}
                onDrop={createImageHandler('image3', setImage3Option)}
                onDelete={createRemoveFileHandler('image3')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle4">Image4</Typography>
              <RHFUpload
                name="image4"
                maxSize={3145728}
                onDrop={createImageHandler('image4', setImage4Option)}
                onDelete={createRemoveFileHandler('image4')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle5">Image5</Typography>
              <RHFUpload
                name="image5"
                maxSize={3145728}
                onDrop={createImageHandler('image5', setImage5Option)}
                onDelete={createRemoveFileHandler('image5')}
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle6">Image6</Typography>
              <RHFUpload
                name="image6"
                maxSize={3145728}
                onDrop={createImageHandler('image6', setImage6Option)}
                onDelete={createRemoveFileHandler('image6')}
              />
            </Stack>
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

        {renderDocumentForm}



        {renderActions}
      </Grid>
    </FormProvider>

  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
