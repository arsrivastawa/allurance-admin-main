import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import AppWelcome from './app-welcome';
import AppFeatured from './app-featured';
import AppNewInvoice from './app-new-invoice';
import AppTopAuthors from './app-top-authors';
import AppTopRelated from './app-top-related';
import AppAreaInstalled from './app-area-installed';
import AppWidgetSummary from './app-widget-summary';
import AppCurrentDownload from './app-current-download';
import AppTopInstalledCountries from './app-top-installed-countries';
import { SeoIllustration } from 'src/assets/illustrations';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useTheme } from '@mui/material/styles';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';
import AppWidget from './app-widget';
import { fetchDataFromApi } from 'src/utils/commonFunction';
import { TICKETS_ENDPOINT } from 'src/utils/apiEndPoints';

const SupportChannelDashboard = () => {
    const { user } = useMockedUser();
    const [tableData, setTableData] = useState([]);
    const theme = useTheme();

    const FetchTickets = async () => {
        try {
            const apiUrl = TICKETS_ENDPOINT;
            const responseData = await fetchDataFromApi(apiUrl, 'GET');
            if (responseData) {
                setTableData(responseData); // Set the response data to the tableData state
            }
        } catch (error) {
            console.error("Error fetching designer data:", error);
        }
    };

    useEffect(() => {
        FetchTickets();
    }, []);

    return (
        <Grid container spacing={3}>
            <Grid xs={12} md={12}>
                <AppWelcome
                    title={`Welcome back 👋 \n ${user?.displayName}`}
                    description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
                    img={<SeoIllustration />}
                    action={
                        <Button variant="contained" color="primary">
                            Go Now
                        </Button>
                    }
                />
            </Grid>
            <Grid xs={12} lg={12}>
                <AppNewInvoice
                    title="Tickets"
                    tableData={tableData}
                    tableLabels={[
                        { id: 'ticket_id', label: 'Ticket Id' },
                        { id: 'ticket_status', label: 'Ticket Status' },
                        { id: 'description', label: 'Description' },
                        { id: 'status', label: 'Status' },
                        { id: '' },
                    ]}
                />
            </Grid>
        </Grid>
    )
}

export default SupportChannelDashboard