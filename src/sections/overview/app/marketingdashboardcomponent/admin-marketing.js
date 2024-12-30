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
import { CAMPAIGN_ENDPOINT, MARKETING_DASHBOARD_ENDPOINT, MARKETING_ENDPOINT } from 'src/utils/apiEndPoints';
import { fetchDataFromApi } from 'src/utils/commonFunction';

const MarketingDashboard = () => {
    const { user } = useMockedUser();
    const [tableData, setTableData] = useState([]); // Initialize with an empty array
    const [campaignData, setCampaignData] = useState([]); // Initialize with an empty array
    const [requestCount, setrequestCount] = useState(0); // Initialize with an empty array
    const [approvedCount, setapprovedCount] = useState(0); // Initialize with an empty array
    const [deletedCount, setdeletedCount] = useState(0); // Initialize with an empty array
    const theme = useTheme();

    const MarketingDetails = async () => {
        try {
            const apiUrl = MARKETING_DASHBOARD_ENDPOINT;
            const responseData = await fetchDataFromApi(apiUrl, 'GET');
            if (responseData) {
                setTableData(responseData); // Set the response data to the tableData state
            }
        } catch (error) {
            console.error("Error fetching designer data:", error);
        }
    };

    const CampaignData = async () => {
        try {
            const apiUrl = CAMPAIGN_ENDPOINT;
            const responseData = await fetchDataFromApi(apiUrl, 'GET');
            if (responseData) {
                setCampaignData(responseData); // Set the response data to the tableData state
            }
        } catch (error) {
            console.error("Error fetching designer data:", error);
        }
    };

    useEffect(() => {
        MarketingDetails();
        CampaignData();
    }, []);

    useEffect(() => {
        setrequestCount(tableData.filter(item => item.record_status === 1).length || 0)
        setapprovedCount(tableData.filter(item => item.record_status === 2).length || 0)
        setdeletedCount(tableData.filter(item => item.record_status === 3).length || 0)
    }, [tableData])

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

            <Grid xs={12} md={4}>
                <AppWidgetSummary
                    title="Pending Products"
                    percent={''}
                    total={requestCount || 0}
                    chart={{
                        colors: [theme.palette.warning.light, theme.palette.warning.main],
                        series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
                    }}
                />
            </Grid>

            <Grid xs={12} md={4}>
                <AppWidgetSummary
                    title="Approved Products"
                    percent={''}
                    total={approvedCount || 0}
                    chart={{
                        colors: [theme.palette.success.light, theme.palette.success.main],
                        series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
                    }}
                />
            </Grid>

            <Grid xs={12} md={4}>
                <AppWidgetSummary
                    title="Rejected Products"
                    percent={''}
                    total={deletedCount || 0}
                    chart={{
                        colors: [theme.palette.error.light, theme.palette.error.main],
                        series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
                    }}
                />
            </Grid>


            <Grid xs={12} lg={12}>
                <AppNewInvoice
                    title="New Invoice"
                    tableData={campaignData}
                    tableLabels={[
                        { id: 'campaign_name', label: 'Campaign name' },
                        { id: 'category', label: 'Category' },
                        { id: 'price', label: 'Price' },
                        { id: 'status', label: 'Status' },
                        { id: '' },
                    ]}
                />
            </Grid>
        </Grid>
    )
}

export default MarketingDashboard
