import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Checkbox from '@mui/material/Checkbox';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
    RHFAutocomplete,
} from 'src/components/hook-form';
import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { ROLE_ENDPOINT, ROLE_PERMISSION_ENDPOINT } from '../../utils/apiEndPoints';
import Box from '@mui/material/Box';
export default function ProductNewEditForm({ currentProduct, permissions }) {
    const router = useRouter();
    const [roleOptions, setRoleOptions] = useState([]);
    const [permissionOptions, setPermissionOptions] = useState([]);
    const [selectedRoleID, setSelectedRoleID] = useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const NewProductSchema = Yup.object().shape({
        role_id: Yup.string().required('Role ID is required'),
    });

    const defaultValues = useMemo(
        () => ({
            role_id: ''
        }),
        []
    );

    const methods = useForm({
        resolver: yupResolver(NewProductSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            reset();
            const permissionValues = permissionOptions.map(permission => ({
                id: permission.id,
                read_access: permission.read_access,
                add_access: permission.add_access,
                update_access: permission.update_access,
                delete_access: permission.delete_access,
            }));
            const token = await sessionStorage.getItem('accessToken');
            const apiUrl = ROLE_PERMISSION_ENDPOINT;
            const fetchMethod = "POST";
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            permissionValues.headers = { Authorization: `Bearer ${token}` }
            const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, permissionValues);
            if (response.ok) {
                enqueueSnackbar('Record Successfully Updated');
                setSelectedRoleID(0);
                router.push(paths.dashboard.role.managepermission);
            } else {
                const responseData = await response.json();
                if (responseData && responseData.error) {
                    enqueueSnackbar(responseData.error, { variant: 'error' });
                }
            }
        } catch (err) {
            console.error(err.message);
        }
    });

    const getRoleListingData = async (shapeId = null) => {
        try {
            const apiUrl = ROLE_ENDPOINT;
            const fetchMethod = 'GET';
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };
            const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setRoleOptions(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const getPermissionListingData = async (selectedRoleID) => {
        try {
            const apiUrl = `${ROLE_PERMISSION_ENDPOINT}/${selectedRoleID}`;
            const response = await ManageAPIsData(apiUrl, 'GET');
            if (response.status != 200) {
                setSelectedRoleID(0)
                setPermissionOptions([]);
            }
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setPermissionOptions(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        getRoleListingData();
    }, []);

    const handleRoleSelectionChange = (e) => {
        const selectedID = e;
        methods.setValue('role_id', selectedID);
        getPermissionListingData(selectedID);
        setSelectedRoleID(selectedID);
    };

    const handleCheckboxChange = (id, type) => {
        setPermissionOptions(prevPermissionList => {
            const updatedPermissionList = prevPermissionList.map(permission => {
                if (permission.id === id) {
                    permission[type] = permission[type] === 1 ? 0 : 1;
                }
                return { ...permission };
            });
            return [...updatedPermissionList];
        });
    };

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
                        <RHFAutocomplete
                            id="role_id"
                            name="role_id"
                            label="Role"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            PaperPropsSx={{ textTransform: 'capitalize' }}
                            options={roleOptions.map((option) => ({ name: option.name, value: option.id }))}
                            getOptionLabel={(option) => (typeof option === 'object' ? option.name : '')}
                            getOptionValue={(option) => (typeof option === 'object' ? option.id : '')}
                            value={roleOptions.find((option) => option.id === methods.watch('role_id')) || null}
                            onChange={(e, value) => {
                                handleRoleSelectionChange(value?.value);
                                methods.setValue('role_id', value ? value.value : '');
                            }}
                        />
                    </Box>
                </Card>
            </Grid>
        </>
    );

    const renderTable = (
        <>
            <Grid xs={12} md={12}>
                <Card sx={{ p: 3 }} style={{ backgroundColor: '#fbfbfb' }}>
                    <Box
                        rowGap={3}
                        columnGap={2}
                        display="grid"
                        gridTemplateColumns={{
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(1, 1fr)',
                        }}
                    >
                        <table className="table table-permission" style={{ textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Module Name</th>
                                    <th scope="col">Read</th>
                                    <th scope="col">Add</th>
                                    <th scope="col">Update</th>
                                    <th scope="col">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissionOptions && permissionOptions.length > 0 ? (
                                    permissionOptions.map((data, index) => {
                                        return (
                                            <tr key={data.id}>
                                                <td scope="row">{data.id}</td>
                                                <td>{data.name ? data.name : ''}</td>
                                                <td>
                                                    <Checkbox
                                                        color="success"
                                                        name={`read_access_${data.id}`}
                                                        value={data.read_access}
                                                        onChange={() => handleCheckboxChange(data.id, 'read_access')}
                                                        checked={data.read_access === 1}
                                                    />
                                                </td>
                                                <td>
                                                    <Checkbox
                                                        color="success"
                                                        name={`add_access_${data.id}`}
                                                        value={data.add_access}
                                                        onChange={() => handleCheckboxChange(data.id, 'add_access')}
                                                        checked={data.add_access === 1}
                                                    />
                                                </td>
                                                <td>
                                                    <Checkbox
                                                        color="success"
                                                        name={`update_access_${data.id}`}
                                                        value={data.update_access}
                                                        onChange={() => handleCheckboxChange(data.id, 'update_access')}
                                                        checked={data.update_access === 1}
                                                    />
                                                </td>
                                                <td>
                                                    <Checkbox
                                                        color="success"
                                                        name={`delete_access_${data.id}`}
                                                        value={data.delete_access}
                                                        onChange={() => handleCheckboxChange(data.id, 'delete_access')}
                                                        checked={data.delete_access === 1}
                                                    />
                                                </td>
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
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                {renderForm}
                {selectedRoleID > 0 && renderTable}
                {selectedRoleID > 0 && (
                    <Grid xs={12} md={12}>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                            Save Permission
                        </LoadingButton>
                    </Grid>
                )}
            </Grid>
        </FormProvider>
    );
}

ProductNewEditForm.propTypes = {
    currentProduct: PropTypes.object,
    permissions: PropTypes.array,
};
