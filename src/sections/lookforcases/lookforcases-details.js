import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Details } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import ChatComponent from './chatcomponent';
import { TICKET_RESPONSE_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

export default function InvoiceDetails({ invoice }) {
    const [userid, setUserid] = useState('');

    const getStatusLabel = (status) => {
        switch (status) {
            case 1:
                return <Label variant="soft" color="warning">Pending</Label>;
            case 2:
                return <Label variant="soft" color="success">Open</Label>;
            case 3:
                return <Label variant="soft" color="error">Closed</Label>;
            default:
                return <Label variant="soft" color="default">Unknown</Label>;
        }
    };

    const fetchUserDetails = async () => {
        const STORAGE_KEY = 'accessToken';
        const accessToken = sessionStorage.getItem(STORAGE_KEY);
        if (!accessToken) {
            return;
        }
        try {
            const decoded = jwtDecode(accessToken);
            const userdata = decoded?.data;
            if (userdata) {
                setUserid(userdata.id);
            } else {
                console.error("Role ID not found in decoded token.");
            }
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <>
            <Card sx={{ pt: 3, px: 3, py: 3, position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        textAlign: 'right',
                    }}
                >
                    {getStatusLabel(invoice?.ticket_status)}
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        Created at: {fDate(invoice?.created_at)}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Stack sx={{ typography: 'body2' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 'calc(1rem + 1px)' }}>
                                Case Information
                            </Typography>
                            <Stack spacing={2}>
                                <Typography variant="subtitle2">Case ID: {invoice?.ticket_id}</Typography>
                                <Typography variant="subtitle2">Reason: {invoice?.title}</Typography>
                                <Typography variant="subtitle2">Description: {invoice?.description}</Typography>
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Stack sx={{ typography: 'body2' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 'calc(1rem + 1px)' }}>
                                User Information
                            </Typography>
                            <Stack spacing={2}>
                                {invoice?.first_name && invoice?.last_name ? (
                                    <Typography variant="subtitle2">User Name: {invoice.first_name + " " + invoice.last_name}</Typography>
                                ) : (
                                    <Typography variant="subtitle2">User Name: </Typography>
                                )}
                                {invoice?.email ? (
                                    <Typography variant="subtitle2">E-mail: {invoice.email}</Typography>
                                ) : (
                                    <Typography variant="subtitle2">E-mail: </Typography>
                                )}
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Card>
            {userid === invoice?.operate_by && (
                <Card sx={{ mt: 2 }}>
                    <ChatComponent
                        userid={userid}
                        invoiceId={invoice.id}
                        ResponseId={invoice.user_id}
                    />
                </Card>
            )}
        </>
    );
}

InvoiceDetails.propTypes = {
    invoice: PropTypes.object.isRequired,
};
