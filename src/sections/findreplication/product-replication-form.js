import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ManageAPIsData } from '../../utils/commonFunction';
import { REPLICATOR_ENDPOINT } from '../../utils/apiEndPoints';
import Box from '@mui/material/Box';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

export default function ProductReplicationForm({ id }) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const NewProductSchema = Yup.object().shape({
        quantity: Yup.number().required('Quantity is required').positive('Quantity must be a positive number').integer('Quantity must be an integer'),
    });

    const methods = useForm({
        resolver: yupResolver(NewProductSchema),
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            const payload = {
                designer_id: id,
                quantity: data.quantity,
            };

            const response = await ManageAPIsData(REPLICATOR_ENDPOINT, 'POST', payload);

            if (response.ok) {
                enqueueSnackbar('Replication success!');
                router.push(paths.dashboard.findreplicationmodel.root);
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

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
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
                            <Typography variant="body1" component="div">
                                Model ID: {id}
                            </Typography>
                            <RHFTextField name="quantity" label="Quantity" type="number" />
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting}>
                        Submit
                    </LoadingButton>
                </Grid>
            </Grid>
        </FormProvider>
    );
}

ProductReplicationForm.propTypes = {
    id: PropTypes.string.isRequired,
};
