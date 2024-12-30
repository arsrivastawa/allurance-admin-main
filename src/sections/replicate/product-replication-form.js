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

import { ManageAPIsData, createImageOption, fetchDataFromApi } from '../../utils/commonFunction';
import { CATEGORY_ENDPOINT, RESINTYPE_ENDPOINT, SHAPE_ENDPOINT, SIZEFORSHAPE_ENDPOINT, BEZELMATERIAL_ENDPOINT, BEZELCOLOR_ENDPOINT, INNERMATERIAL_ENDPOINT, FLOWER_ENDPOINT, COLORSHADE_ENDPOINT, DESIGNER_ENDPOINT } from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';


// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductReplicationForm({ currentProduct }) {
    const router = useRouter();
    const mdUp = useResponsive('up', 'md');
    const { enqueueSnackbar } = useSnackbar();
    const NewProductSchema = Yup.object().shape({
        id: Yup.string().required('Model ID is required'),
        quantity: Yup.string().required('quantity is required'),
    });

    const governmentBasePath = '/assets/images/documents/government/';

    const defaultValues = useMemo(
        () => ({
            id: currentProduct?.id || '',
            quantity: currentProduct?.quantity || '',

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

    // HandleImage - While submit time
    const handleImage = async (data, imageKey, stateImageOption) => {
        const image = data[imageKey];
        if (image && Object.keys(image).length) {
            if (typeof image === 'string' && image.includes(governmentBasePath)) {
                data[imageKey] = image.replace(governmentBasePath, '');
            }
            if (stateImageOption) {
                data[imageKey].imgData = await createImageOption(data, imageKey);
            }
        }
    };

    // Manage Add or Update
    const onSubmit = handleSubmit(async (data) => {
        try {
            const apiUrl = currentProduct ? `${DESIGNER_ENDPOINT}?id=${currentProduct.id}` : DESIGNER_ENDPOINT;
            const fetchMethod = currentProduct ? "PUT" : "POST";
            const response = await ManageAPIsData(apiUrl, fetchMethod, data);

            if (response.ok) {
                enqueueSnackbar(currentProduct ? 'Replication success!' : 'Replication success!');
                router.push(paths.dashboard.replicate.root);
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

    // const [error, setError] = useState("");

    const renderNormalForm = (
        <>
            {/* <Grid xs={12} md={12}>
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
                        <Label
                            variant="soft"
                            color={(currentProduct?.record_status === 2 && 'success') || (currentProduct?.record_status === 3 && 'error') || 'default'}>{(currentProduct?.record_status === 2 && 'Approved') || (currentProduct?.record_status === 3 && 'Rejected') || 'Pending'}</Label>
                        <RHFTextField name="id" label="Model ID" />
                        <RHFTextField name="quantity" label="Quantity" />
                    </Box>
                </Card>
            </Grid> */}
            <Grid xs={12} md={12}>
                <Card sx={{ p: 3, position: 'relative' }}>
                    <Label
                        variant="soft"
                        color={(currentProduct?.record_status === 2 && 'success') || (currentProduct?.record_status === 3 && 'error') || 'default'}
                        sx={{
                            position: 'absolute',
                            top: 15,
                            right: 20,
                            zIndex: 1,
                            fontSize: 'small',
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 8px', // Add padding to the label
                            borderRadius: '4px', // Add border radius for a rounded appearance
                        }}
                    >
                        {(currentProduct?.record_status === 2 && 'Approved') || (currentProduct?.record_status === 3 && 'Rejected') || 'Pending'}
                    </Label>
                    <Box
                        rowGap={3}
                        columnGap={2}
                        display="grid"
                        gridTemplateColumns={{
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(2, 1fr)',
                        }}
                        sx={{ marginTop: '40px' }} // Adjust margin top to create space for the label
                    >
                        <RHFTextField name="id" label="Model ID" />
                        <RHFTextField name="quantity" label="Quantity" />
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
                    {!currentProduct ? 'Submit' : 'Replicate'}
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

ProductReplicationForm.propTypes = {
    currentProduct: PropTypes.object,
};
