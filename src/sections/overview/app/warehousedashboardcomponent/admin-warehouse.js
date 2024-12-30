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
import { ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { RACKS_DASHBOARD_ENDPOINT, WAREHOUSE_ENDPOINT } from 'src/utils/apiEndPoints';
import AppNewInvoices from './app-new-invoices';

const WarehouseDashboard = () => {
    const { user } = useMockedUser();
    const [tableData, setTableData] = useState([]); // Initialize with an empty array
    const [CartonData, setCartonData] = useState([]); // Initialize with an empty array
    const theme = useTheme();
    const getListingData = async () => {
        try {
            const fetchMethod = 'GET';
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };
            const response = await ManageAPIsDataWithHeader(WAREHOUSE_ENDPOINT, fetchMethod, { headers });
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setTableData(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const getListingCartonsData = async () => {
        try {
            const fetchMethod = 'GET';
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };
            const response = await ManageAPIsDataWithHeader(RACKS_DASHBOARD_ENDPOINT, fetchMethod, { headers });
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setCartonData(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        getListingData();
        getListingCartonsData();
    }, []);
    return (
        <Grid container spacing={3}>
            <Grid xs={12} md={8}>
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

            <Grid xs={12} md={6} lg={4}>
                <AppCurrentDownload
                    title="Current Download"
                    chart={{
                        series: [
                            { label: 'Mac', value: 12244 },
                            { label: 'Window', value: 53345 },
                            { label: 'iOS', value: 44313 },
                            { label: 'Android', value: 78343 },
                        ],
                    }}
                />
            </Grid>
            <Grid xs={12} lg={4}>
                <AppNewInvoices
                    title="Cartons Details"
                    tableData={CartonData}
                    tableLabels={[
                        { id: 'carton_name', label: 'Carton Name' },
                        { id: 'assigned_channel_name', label: 'Assigned to ' },
                    ]}
                />
            </Grid>
            <Grid xs={12} lg={8}>
                <AppNewInvoice
                    title="Warehouse Details"
                    tableData={tableData}
                    tableLabels={[
                        { id: 'rack_title', label: 'Rack name' },
                        { id: 'rack_code', label: 'Rack Code' },
                        { id: 'count', label: 'Cartons' },
                        { id: '' },
                    ]}
                />
            </Grid>
        </Grid>
    )
}

export default WarehouseDashboard