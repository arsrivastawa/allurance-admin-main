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
import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FETCH_PRODUCTS_BY_CATEGORY, MARKETING_ENDPOINT, MARKETING_RMV_IMG_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData, ManageAPIsDataWithHeader, ManageAPIsDataWithHeaderWithFiles, createFileOptions, createImageOption, createImageOptions, processImageUpload } from 'src/utils/commonFunction';
import { useSnackbar } from 'src/components/snackbar';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';


export default function ProductNewEditForm({ invoice }) {
  const governmentBasePath = '/assets/images/documents/government/';
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [statesetVideo1Option, setVideo1Option] = useState(false);
  const [statesetMarketData, SetMarketData] = useState(false);
  // const Activity = Array.isArray(statesetMarketData) ? statesetMarketData : statesetMarketData;
  // console.log("ActivityActivity", Activity);
  const [EditMode, SetEditMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [ProductsOptions, setProductOptions] = useState([]);
  const [isEditable, setIsEditable] = useState({
    name: false,
    weight: false,
    base_price: false,
    retail_price: false,
    bulk_price: false,
    collection: false,
    video_url: false,
    similar_options: false,
    description: false
  });
  const { id } = useParams(); // Extract the id parameter from the URL

  const handleUpdate = (fieldName) => {
    setIsEditable((prevState) => ({
      ...prevState,
      [fieldName]: !prevState[fieldName], // Toggle the edit state for the specified field
    }));
  };
  useEffect(() => {
    // Check if the URL matches the desired pattern
    if (window.location.pathname === `/dashboard/marketing/${id}/edit/`) {
      // Disable all input fields
      const inputFields = document.querySelectorAll('input, textarea, select');
      inputFields.forEach(field => {
        field.disabled = true;
      });
      const pathPattern = `/dashboard/marketing/${id}/edit/`;
      // setIsEditable(location.pathname === pathPattern);
      SetEditMode(location.pathname === pathPattern ? true : false)
      setIsEditable(location.pathname === pathPattern ? {
        name: true,
        weight: true,
        base_price: true,
        retail_price: true,
        bulk_price: true,
        images: true,
        collection: true,
        similar_options: true,
        description: true
      } : {
        name: false,
        weight: false,
        base_price: false,
        retail_price: false,
        images: false,
        bulk_price: false,
        collection: false,
        similar_options: false,
        description: false
      });
      FetchMarketingDetails(id);
    }
  }, [id]);

  async function FetchMarketingDetails(designerId) {
    try {
      const apiUrl = `${MARKETING_ENDPOINT}/${designerId}`;
      const response = await ManageAPIsData(apiUrl, 'GET');

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (Object.keys(responseData).length) {
        SetMarketData(responseData.data);
        console.log("responseData.dataresponseData.data", responseData.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const { enqueueSnackbar } = useSnackbar();
  const handleOpenLightbox = (image) => {
    setSelectedImage(image);
    setOpenLightbox(true);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setOpenLightbox(false);
  };

  const [fetchimages, setFetchImages] = useState(null);

  // useEffect(() => {
  //   if(statesetMarketData) {
  //     const fetchedData = (statesetMarketData?.files || []).map(file => ({
  //       id: file.id,
  //       file: file.file
  //     }));
  //     setFetchImages(fetchedData);
  //   }
  // }, [statesetMarketData]); 

  useEffect(() => {
    if (statesetMarketData) {
      setTimeout(() => {
        const fetchedData = (statesetMarketData?.files || []).map(file => ({
          id: file.id,
          preview: file.file,  // Correct URL from your response
        }));
        setFetchImages(fetchedData);
      }, 1000); // 1 second delay
    }
  }, [statesetMarketData]);
  

  const defaultValues = useMemo(
    () => ({
      name: statesetMarketData?.title || '',
      weight: statesetMarketData?.weight || '',
      base_price: statesetMarketData?.base_price || '',
      description: statesetMarketData?.description || '',
      retail_price: statesetMarketData?.retail_price || '',
      bulk_price: statesetMarketData?.bulk_price || '',
      files: fetchimages || null,
      collection: statesetMarketData?.collection || '',
      similar_options: statesetMarketData?.similar_options || '',
    }),
    [statesetMarketData, fetchimages]
  );
  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Title is required'),
    files: Yup.array().min(1, 'Images are required'),
    weight: Yup.string().required('weight is required'),
    base_price: Yup.string().required('Base Price is required'),
    retail_price: Yup.string().required('Retail Price is required'),
    bulk_price: Yup.string().required('Bulk Price is required'),
  });
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
  
  useEffect(() => {
    if (statesetMarketData) {

      reset(defaultValues);
    }
  }, [statesetMarketData, defaultValues, reset]);

 
 

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const files = values.files || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('files', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.files]
  );

 
  const handleRemoveFile = useCallback(
    async (inputFile) => {
      let updatedFiles = values.files;

      if (inputFile.id) {
        try {
          const apiUrl = `${MARKETING_RMV_IMG_ENDPOINT}/${inputFile.id}`;
          const response = await ManageAPIsData(apiUrl, 'DELETE');
          if (response.ok) {
            enqueueSnackbar('Image removed successfully!', { variant: 'success' });
          } else {
            const responseData = await response.json();
            if (responseData && responseData.error) {
              enqueueSnackbar(responseData.error, { variant: 'error' });
            }
          }
        } catch (error) {
          enqueueSnackbar('Error removing image', { variant: 'error' });
          return;
        }
      }
      updatedFiles = updatedFiles.filter((file) => file.preview !== inputFile.preview);

      setValue('files', updatedFiles);
    },
    [setValue, values.files]
  );


  const onSubmit = handleSubmit(async (data) => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    if (!accessToken) {
      console.error("Token is undefined.");
      return;
    }

    const decoded = jwtDecode(accessToken);
    const user_id = decoded?.data?.id;

    try {
      const formData = new FormData();
      data.designer_id = invoice?.id;
      data.user_id = user_id;

      formData.append('name', data.name || '');
      formData.append('weight', data.weight || '');
      formData.append('base_price', data.base_price || '');
      formData.append('description', data.description || '');
      formData.append('retail_price', data.retail_price || '');
      formData.append('bulk_price', data.bulk_price || '');
      formData.append('collection', data.collection || '');
      formData.append('similar_options', data.similar_options || '');
      formData.append('designer_id', invoice?.id || statesetMarketData?.designer_id);
      formData.append('user_id', user_id || '');

      if (data?.files && data.files.length) {
        data.files.forEach((file, index) => {
          formData.append('files', file);
        });
      } else {
        console.log("No files to append.");
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      const apiUrl = statesetMarketData ? `${MARKETING_ENDPOINT}/${statesetMarketData?.id}` : MARKETING_ENDPOINT;
      const fetchMethod = statesetMarketData ? "PUT" : "POST";

      // const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, formData);
      const response = await ManageAPIsDataWithHeaderWithFiles(apiUrl, fetchMethod, formData);
      if (response.ok) {
        statesetMarketData ?
          enqueueSnackbar('Update success!') : enqueueSnackbar('Create success!');
        router.push(paths.dashboard.marketing.root);
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error("Error during submission:", error.message);
    }
  });



  useEffect(() => {
    // fetchProducts();
    if (statesetMarketData) {
      // Extract the product IDs from the statesetMarketData and store them in selectedProducts
      const productsArray = statesetMarketData?.similar_options?.split(',').map(item => parseInt(item));
      setSelectedProducts(productsArray);
    }
  }, [statesetMarketData]);
  const handleSelectChangeProducts = (event) => {
    const { value } = event.target;
    setSelectedProducts(value);
  };

  return (
    <>
      <Card sx={{ pt: 5, px: 5, py: 5 }}>
        <Box rowGap={5} display="grid" alignItems="center" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
              Design Information
            </Typography>
            <Stack spacing={3}>
              <Typography variant="subtitle2">Model Number: {statesetMarketData.design_information?.model_number || invoice?.model_number}</Typography>
              <Typography variant="subtitle2">SKU: {statesetMarketData.design_information?.title || invoice?.title}</Typography>
              <Typography variant="subtitle2">Category: {statesetMarketData.design_information?.category_name || invoice?.category_name}</Typography>
              <Typography variant="subtitle2">In Pair: {statesetMarketData.design_information?.in_pair || invoice?.in_pair}</Typography>
              <Typography variant="subtitle2">Resin Name: {statesetMarketData.design_information?.resin_name || invoice?.resin_name}</Typography>
              <Typography variant="subtitle2">Shape: {statesetMarketData.design_information?.shape_shape || invoice?.shape_shape}</Typography>
              <Typography variant="subtitle2">Bezel Material: {statesetMarketData.design_information?.bezel_material_name || invoice?.bezel_material_name}</Typography>
              <Typography variant="subtitle2">Bezel Color: {statesetMarketData.design_information?.bezel_color_name || invoice?.bezel_color_name}</Typography>
              <Typography variant="subtitle2">Inner Material: {statesetMarketData.design_information?.Inner_material_name || invoice?.Inner_material_name}</Typography>
              <Typography variant="subtitle2">Flower Name: {statesetMarketData.design_information?.flower_name || invoice?.flower_name}</Typography>
              <Typography variant="subtitle2">Color: {statesetMarketData.design_information?.color_name || invoice?.color_name}</Typography>
            </Stack>
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
              Uploaded Images
            </Typography>
            <Box display="flex" flexWrap="wrap">
              {[statesetMarketData.design_information?.image1 || invoice?.image1, statesetMarketData.design_information?.image2 || invoice?.image2, statesetMarketData.design_information?.image3 || invoice?.image3, statesetMarketData.design_information?.image4 || invoice?.image4, statesetMarketData.design_information?.image5 || invoice?.image5, statesetMarketData.design_information?.image6 || invoice?.image6]
                .filter((image) => image) // Filter out undefined or null images
                .map((image, index) => (
                  <Image
                    key={index}
                    alt={`Image ${index + 1}`}
                    src={image}
                    style={{ width: 100, height: 100, marginRight: 8, marginBottom: 8 }}
                    sx={{
                      borderRadius: 2,
                      my: { xs: 5, md: 2 },
                      mr: 2,
                    }}
                    onClick={() => handleOpenLightbox(image)}
                  />
                ))}
            </Box>
            {[statesetMarketData.design_information?.image1 || invoice?.image1, statesetMarketData.design_information?.image2 || invoice?.image2, statesetMarketData.design_information?.image3 || invoice?.image3, statesetMarketData.design_information?.image4 || invoice?.image4, statesetMarketData.design_information?.image5 || invoice?.image5, statesetMarketData.design_information?.image6 || invoice?.image6]
              .every((image) => !image) && (
                <Typography variant="body2" color="text.secondary">
                  No images uploaded
                </Typography>
              )}
          </Stack>
        </Box>
        <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
        <Typography sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
          Product Details
        </Typography>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <RHFTextField id="name" name="name" label="Name" fullWidth disabled={isEditable.name} />
                {EditMode && (
                  <LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('name')} sx={{ mt: 1, p: 2 }}>
                    Edit
                  </LoadingButton>
                )}
              </Grid>
              <Grid item xs={6}>
                <RHFTextField id="weight" name="weight" label="Weight" fullWidth disabled={isEditable.weight} />
                {EditMode && (
                  <LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('weight')} sx={{ mt: 1, p: 2 }}>
                    Edit
                  </LoadingButton>
                )}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <RHFTextField id="base_price" name="base_price" label="Base Price ( in ₹ )" type="number" fullWidth disabled={isEditable.base_price} />
                {EditMode && (<LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('base_price')} sx={{ mt: 1, p: 2 }}>
                  Edit
                </LoadingButton>)}
              </Grid>
              <Grid item xs={6}>
                <RHFTextField id="retail_price" name="retail_price" label="Retail Price ( in ₹ )" type="number" fullWidth disabled={isEditable.retail_price} />
                {EditMode && (<LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('retail_price')} sx={{ mt: 1, p: 2 }}>
                  Edit
                </LoadingButton>)}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <RHFTextField id="bulk_price" name="bulk_price" label="Bulk Price ( in ₹ )" type="number" fullWidth disabled={isEditable.bulk_price} />
                {EditMode && (<LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('bulk_price')} sx={{ mt: 1, p: 2 }}>
                  Edit
                </LoadingButton>)}
              </Grid>
              <Grid item xs={6}>
                <RHFTextField id="Collection" name="collection" label="Collection" fullWidth disabled={isEditable.collection} />
                {EditMode && (<LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('collection')} sx={{ mt: 1, p: 2 }}>
                  Edit
                </LoadingButton>)}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField id="similar_options" name="similar_options" label="Similar Options" fullWidth disabled={isEditable.similar_options} />
                {EditMode && (<LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('similar_options')} sx={{ mt: 1, p: 2 }}>
                  Edit
                </LoadingButton>)}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
            </Grid>
            <RHFTextField id="description" name="description" label="Description" multiline rows={4} fullWidth disabled={isEditable.description} />
          </Stack>
          {EditMode && (<LoadingButton type="button" size="small" variant="outlined" onClick={() => handleUpdate('description')} sx={{ mt: 1, p: 2 }}>
            Edit
          </LoadingButton>)}
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Upload Files</Typography>
            <RHFUpload
              multiple
              thumbnail
              name="files"
              maxSize={3145728}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
            // onUpload={() => console.info('ON UPLOAD')}
            />
          </Stack>
          <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting} sx={{ mt: 2 }}>
            {EditMode ? "Update" : "Create"}
          </LoadingButton>
        </FormProvider>
      </Card >
      {/* <Lightbox index={selectedImage} slides={[...Array(6)].map((_, index) => ({ src: invoice[`image${index + 1}`] }))} open={openLightbox} close={handleCloseLightbox} /> */}
    </>
  );
}

ProductNewEditForm.propTypes = {
  invoice: PropTypes.object.isRequired,
};
