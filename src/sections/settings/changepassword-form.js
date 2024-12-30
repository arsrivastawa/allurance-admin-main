// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
// import Stack from '@mui/material/Stack';
// import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
// import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
// import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useBoolean } from 'src/hooks/use-boolean';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Iconify from 'src/components/iconify';
// import { useResponsive } from 'src/hooks/use-responsive';

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
    // RHFSwitch,
    RHFSelect,
    RHFTextField,
    // RHFUploadAvatar,
    // RHFAutocomplete,
} from 'src/components/hook-form';

import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { USER_CHANGEPASSWORD_ENDPOINT } from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
    const router = useRouter();

    const password = useBoolean();
    // const mdUp = useResponsive('up', 'md');

    const { enqueueSnackbar } = useSnackbar();


    const NewProductSchema = Yup.object().shape({
        current_password: Yup.string().required('Current Password is required'),
        new_password: Yup.string().required('New Password is required'),
        confirm_password: Yup.string().required('Confirm Password is required'),
    });

    const defaultValues = useMemo(
        () => ({
            current_password: '',
            new_password: '',
            confirm_password: '',
        }),
        []
    );

    const methods = useForm({
        resolver: yupResolver(NewProductSchema),
        defaultValues,
    });

    const {
        reset,
        // watch,
        // setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    // const values = watch();



    // Manage Add or Update
    const onSubmit = handleSubmit(async (data) => {
        try {

            await new Promise((resolve) => setTimeout(resolve, 500));
            reset();

            const apiUrl = `${USER_CHANGEPASSWORD_ENDPOINT}?id=1`;
            const fetchMethod = "PUT";
            // const response = await ManageAPIsData(apiUrl, fetchMethod, data);
            const token = await sessionStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            data.headers = { Authorization: `Bearer ${token}` }
            const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);

            if (response.ok) {
                enqueueSnackbar('Update success!');
                router.push(paths.dashboard.settings.changepassword);
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





    const renderForm = (
        <>

            <Grid xs={12} md={12}>
                <Card sx={{ p: 3 }}>
                    <Box
                        rowGap={3}
                        columnGap={2}
                        display="grid"
                        gridTemplateColumns={{
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(1, 1fr)',
                        }}
                    >

                        <RHFTextField
                            name="current_password"
                            label="Current Password"
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
                        <RHFTextField
                            name="new_password"
                            label="New Password"
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
                        <RHFTextField
                            name="confirm_password"
                            label="Confirm Password"
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

                {renderForm}

                {renderActions}
            </Grid>
        </FormProvider>

    );
}

ProductNewEditForm.propTypes = {
    currentProduct: PropTypes.object,
};
