import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import AppWelcome from './app-welcome';
import AppNewInvoice from './app-new-invoice';
import AppCurrentDownload from './app-current-download';
import { SeoIllustration } from 'src/assets/illustrations';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useTheme } from '@mui/material/styles';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';
import { PACKERS_BOXPACKING_ENDPOINT, PACKERS_CARTONPACKING_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';

const PackerDashboard = () => {
    const [tableData, setTableData] = useState([]);
    const [CartonData, setCartonData] = useState([]);
    const { user } = useMockedUser();
    const theme = useTheme();


    const fetchData = async () => {
        try {
            const apiUrl = `${PACKERS_BOXPACKING_ENDPOINT}`;
            const response = await ManageAPIsData(apiUrl, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (Object.keys(responseData).length) {
                console.log("responseData", responseData)
                setTableData(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const PackersData = async () => {
        try {
            const apiUrl = PACKERS_CARTONPACKING_ENDPOINT;
            const fetchMethod = 'GET';
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };
            const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, { headers });
            const responseData = await response.json();
            if (responseData) {
                setCartonData(responseData.data); // Set the response data to the tableData state
            }
        } catch (error) {
            console.error("Error fetching designer data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        PackersData();
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
                            { label: 'Pending', value: tableData.length },
                        ],
                    }}
                />
            </Grid>
            <Grid xs={12} lg={6}>
                <AppNewInvoice
                    title="Cartons Packed"
                    tableData={CartonData}
                    tableLabels={[
                        { id: 'id', label: 'Carton Name' },
                        { id: 'quantity', label: 'Quantity' },
                        { id: '' },
                    ]}
                />
            </Grid>
        </Grid>
    )
}

export default PackerDashboard
