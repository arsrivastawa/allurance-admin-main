import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import AppWelcome from './app-welcome';
import AppCurrentDownload from './app-current-download';
import { SeoIllustration } from 'src/assets/illustrations';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useTheme } from '@mui/material/styles';
import { ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { DESIGNER_ENDPOINT } from 'src/utils/apiEndPoints';
import AppNewInvoice from './app-new-invoice';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

const DesignerDashboard = () => {
    const { user } = useMockedUser();
    const [tableData, setTableData] = useState([]);
    const theme = useTheme();
    const [statusCounts, setStatusCounts] = useState({ requested: 0, approved: 0, rejected: 0 });

    // Listing data
    const designerData = async () => {
        try {
            const fetchMethod = 'GET';
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is undefined.");
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };
            const response = await ManageAPIsDataWithHeader(DESIGNER_ENDPOINT, fetchMethod, { headers });

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data) {
                setTableData(responseData.data);
                calculateStatusCounts(responseData.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const calculateStatusCounts = (data) => {
        const counts = { requested: 0, approved: 0, rejected: 0 };
        data.forEach(item => {
            if (item.record_status === 1) counts.requested += 1;
            else if (item.record_status === 2) counts.approved += 1;
            else if (item.record_status === 3) counts.rejected += 1;
        });
        setStatusCounts(counts);
    };

    useEffect(() => {
        designerData();
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
                    title="Designs"
                    chart={{
                        series: [
                            { label: 'Rejected', value: statusCounts.rejected },
                            { label: 'Requested', value: statusCounts.requested },
                            { label: 'approved', value: statusCounts.approved },
                        ],
                    }}
                />
            </Grid>
            <Grid xs={12} lg={12}>
                <AppNewInvoice
                    title="Design Details"
                    tableData={tableData} // Pass the fetched data here
                    tableLabels={[
                        { id: 'title', label: 'Design Name' },
                        { id: 'category', label: 'Category' },
                        { id: 'in_pair', label: 'Pair' },
                        { id: 'status', label: 'Status' },
                        { id: '' },
                    ]}
                />
            </Grid>
        </Grid>
    );
};

export default DesignerDashboard;
