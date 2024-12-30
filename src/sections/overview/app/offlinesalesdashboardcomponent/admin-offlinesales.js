import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import AppWelcome from './app-welcome';
import AppNewInvoice from './app-new-invoice';
import { SeoIllustration } from 'src/assets/illustrations';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useTheme } from '@mui/material/styles';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { INE_ADMIN_ORDERS_ENDPOINT } from 'src/utils/apiEndPoints';

const OfflineSalesDashboard = () => {
    const { user } = useMockedUser();
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filter, setFilter] = useState('today');
    const theme = useTheme();

    const getListingData = async () => {
        try {
            const response = await ManageAPIsData(INE_ADMIN_ORDERS_ENDPOINT, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }

            const responseData = await response.json();

            if (responseData.data.length) {
                const filteredData = responseData.data.filter(item => item.channel_mode === 2);
                setTableData(filteredData);
            } else {
                setTableData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const applyFilter = (data, filter) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        if (filter === 'today') {
            return data.filter(item => new Date(item.created_at) >= startOfToday);
        } else if (filter === 'week') {
            return data.filter(item => new Date(item.created_at) >= startOfWeek);
        } else if (filter === 'month') {
            return data.filter(item => new Date(item.created_at) >= startOfMonth);
        } else {
            return data;
        }
    };

    useEffect(() => {
        getListingData();
    }, []);

    useEffect(() => {
        setFilteredData(applyFilter(tableData, filter));
    }, [tableData, filter]);

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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        <MenuItem value="today">Today's Orders</MenuItem>
                        <MenuItem value="week">This Week's Orders</MenuItem>
                        <MenuItem value="month">This Month's Orders</MenuItem>
                    </Select>
                </Box>
                <AppNewInvoice
                    title="Orders"
                    tableData={filteredData}
                    tableLabels={[
                        { id: 'order_id', label: 'Order ID' },
                        { id: 'invoice_id', label: 'Invoice ID' },
                        { id: 'tax_amount', label: 'Tax' },
                        { id: 'total_amount', label: 'Total amount' },
                        { id: 'created_at', label: 'Order Date' },
                        { id: '' },
                    ]}
                />
            </Grid>
        </Grid>
    );
};

export default OfflineSalesDashboard;
