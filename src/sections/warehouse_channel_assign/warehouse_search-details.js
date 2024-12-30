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
} from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { MARKETING_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData, createImageOption, createImageOptions } from 'src/utils/commonFunction';
import { useSnackbar } from 'src/components/snackbar';
import { jwtDecode } from 'src/auth/context/jwt/utils';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

export default function ProductNewEditForm({ invoice }) {

    const [selectedImage, setSelectedImage] = useState(null);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [stateImage1Option, setImage1Option] = useState(false);
    const [stateImage2Option, setImage2Option] = useState(false);
    const [statesetVideo1Option, setVideo1Option] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const handleOpenLightbox = (image) => {
        setSelectedImage(image);
        setOpenLightbox(true);
    };

    const handleCloseLightbox = () => {
        setSelectedImage(null);
        setOpenLightbox(false);
    };


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


    const createVideoHandler = (videoKey, setOption) => useCallback(
        (acceptedFiles) => {
            const videoFile = acceptedFiles[0];

            const newVideoFile = videoFile && Object.assign(videoFile, {
                preview: URL.createObjectURL(videoFile),
            });

            setValue(videoKey, newVideoFile, { shouldValidate: true });
            setOption(true);
        },
        [setValue, setOption]
    );

    const createRemoveVideoHandler = (videoKey) => useCallback(() => {
        setValue(videoKey, null);
    }, [setValue]);


    const NewProductSchema = Yup.object().shape({
        name: Yup.string().required('Title is required'),
        weight: Yup.string().required('weight is required'),
        base_price: Yup.string().required('Base Price is required'),
        retail_price: Yup.string().required('Retail Price is required'),
        bulk_price: Yup.string().required('Bulk Price is required'),
        // bulk_price: Yup.string().required('Bulk Price is required'),
    });

    const defaultValues = useMemo(
        () => ({
            name: invoice?.title || '',
            weight: invoice?.weight || '',
            base_price: invoice?.base_price || '',
            description: invoice?.description || '',
            retail_price: invoice?.retail_price || '',
            bulk_price: invoice?.bulk_price || '',
            image1: invoice?.image1 || '',
            image2: invoice?.image2 || '',
            video_url: invoice?.video_url || '',
            collection: invoice?.collection || '',

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
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    useEffect(() => {
        if (invoice) {
            reset(defaultValues);
        }
    }, [invoice, defaultValues, reset]);


    // HandleImage - While submit time
    const handleImage = async (data, imageKey, stateImageOption) => {
        const image = data[imageKey];
        if (image && Object.keys(image).length) {
            if (typeof image === 'string' && image.includes(governmentBasePath)) {
                data[imageKey] = image.replace(governmentBasePath, '');
            }
            if (stateImageOption) {
                // data[imageKey].imgData = await createImageOption(data, imageKey);
                data[imageKey].imgData = await createImageOptions(image);
            }
        }
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            const STORAGE_KEY = 'accessToken';
            const accessToken = sessionStorage.getItem(STORAGE_KEY);
            const decoded = jwtDecode(accessToken);
            const user_id = decoded?.data?.id;
            try {
                data.designer_id = invoice.id;
                data.designer_model_number = invoice.model_number;
                data.designer_sub_model_number = invoice.sub_model_number;
                data.user_id = user_id;
                await new Promise((resolve) => setTimeout(resolve, 500));
                reset();

                // Handle Image Process
                const imageKeys = ['image1', 'image2'];
                for (const imageKey of imageKeys) {
                    await handleImage(data, imageKey, eval(`state${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}Option`));
                }
                // const apiUrl = invoice ? `${MARKETING_ENDPOINT}?id=${invoice.id}` : MARKETING_ENDPOINT;
                // const fetchMethod = invoice ? "PUT" : "POST";
                const apiUrl = MARKETING_ENDPOINT;
                const fetchMethod = "POST";
                const response = await ManageAPIsData(apiUrl, fetchMethod, data);

                if (response.ok) {
                    enqueueSnackbar('Create success!');
                    router.push(paths.dashboard.marketing.root);
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
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    });

    return (
        <>
            <Card sx={{ pt: 5, px: 5, py: 5 }}>
                <Box rowGap={5} display="grid" alignItems="center" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Design Information
                        </Typography>
                        <Stack spacing={3}>
                            <Typography variant="subtitle2">Model Number: {invoice?.model_number}</Typography>
                            <Typography variant="subtitle2">SKU: {invoice?.title}</Typography>
                            <Typography variant="subtitle2">Category: {invoice?.category_name}</Typography>
                            <Typography variant="subtitle2">In Pair: {invoice?.in_pair}</Typography>
                            <Typography variant="subtitle2">Resin Name: {invoice?.resin_name}</Typography>
                            <Typography variant="subtitle2">Shape: {invoice?.shape_shape}</Typography>
                            <Typography variant="subtitle2">Bezel Material: {invoice?.bezel_material_name}</Typography>
                            <Typography variant="subtitle2">Bezel Color: {invoice?.bezel_color_name}</Typography>
                            <Typography variant="subtitle2">Inner Material: {invoice?.Inner_material_name}</Typography>
                            <Typography variant="subtitle2">Flower Name: {invoice?.flower_name}</Typography>
                            <Typography variant="subtitle2">Color: {invoice?.color_name}</Typography>
                        </Stack>
                    </Stack>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Uploaded Images
                        </Typography>
                        <Box display="flex">
                            {[invoice?.image1, invoice?.image2, invoice?.image3, invoice?.image4, invoice?.image5, invoice?.image6].map((image, index) => (
                                <Image
                                    key={index}
                                    alt={`Image ${index + 1}`}
                                    src={image}
                                    style={{ width: 100, height: 100, marginRight: 2, marginBottom: 2 }}
                                    onClick={() => handleOpenLightbox(image)}
                                />
                            ))}
                        </Box>
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
                                <RHFTextField id="name" name="name" label="Name" fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <RHFTextField id="weight" name="weight" label="Weight" fullWidth disabled />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <RHFTextField id="base_price" name="base_price" label="Base Price" type="number" fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <RHFTextField id="retail_price" name="retail_price" label="Retail Price" type="number" fullWidth disabled />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <RHFTextField id="bulk_price" name="bulk_price" label="Bulk Price" type="number" fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <RHFTextField id="Collection" name="collection" label="Collection" fullWidth disabled />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <RHFTextField id="video_url" name="video_url" label="Video URL" fullWidth disabled />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                        </Grid>
                        <RHFTextField id="description" name="description" label="Description" multiline rows={4} fullWidth disabled />
                    </Stack>
                </FormProvider>
            </Card >
            {/* <Lightbox index={selectedImage} slides={[...Array(6)].map((_, index) => ({ src: invoice[`image${index + 1}`] }))} open={openLightbox} close={handleCloseLightbox} /> */}
        </>
    );
}

ProductNewEditForm.propTypes = {
    invoice: PropTypes.object.isRequired,
};
