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

import { ManageAPIsData } from '../../utils/commonFunction';
import { OTHER_ACTIVITY_ENDPOINT } from '../../utils/apiEndPoints';

import Box from '@mui/material/Box';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
    const router = useRouter();

    const password = useBoolean();
    // const mdUp = useResponsive('up', 'md');

    const { enqueueSnackbar } = useSnackbar();
    const [activityLogOptions, setActivityLogOptions] = useState([]);

    const NewProductSchema = Yup.object().shape({

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

    // Listing data
    const getActivityLoggData = async () => {
        try {
            const apiUrl = `${OTHER_ACTIVITY_ENDPOINT}`;
            const response = await ManageAPIsData(apiUrl, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }

            const responseData = await response.json();

            if (responseData.data.length) {
                setActivityLogOptions(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        getActivityLoggData(); // Fetch all shapes on component mount
    }, []);

    const renderTable = (
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

                        <table className="table table-responsive table-permission" style={{ textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Module Name</th>
                                    <th scope="col">Previous Data</th>
                                    <th scope="col">New Data</th>
                                    <th scope="col">Operation</th>
                                    <th scope="col">User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityLogOptions && activityLogOptions.length > 0 ? (
                                    activityLogOptions.map((data, index) => {
                                        return (
                                            <tr key={data.id}>
                                                <td scope="row">{index + 1}</td>
                                                <td>{data.module_id ? data.module_id : ''}</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>{data.operation ? data.operation : ''}</td>
                                                <td>{data.operation_by ? data.operation_by : ''}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6"><center>Sorry, Records Not Found.</center></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>


                    </Box>

                </Card>
            </Grid>

        </>
    );



    return (
        <FormProvider methods={methods}>
            <Grid container spacing={3}>

                {renderTable}


            </Grid>
        </FormProvider>

    );
}

ProductNewEditForm.propTypes = {
    currentProduct: PropTypes.object,
};
