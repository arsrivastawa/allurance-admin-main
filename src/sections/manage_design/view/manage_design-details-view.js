'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceDetails from '../manage_design-details';
import { DESIGNER_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ id }) {
    const settings = useSettingsContext();
    const [FetchedData, setFetchedData] = useState();

    const currentInvoice = _invoices.filter((invoice) => invoice.id === id)[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = `${DESIGNER_ENDPOINT}/${id}`;
                // const response = await ManageAPIsData(apiUrl, 'GET');
                const token = await sessionStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is undefined.");
                    return;
                }
                let data = {}
                data.headers = { Authorization: `Bearer ${token}` }
                const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (Object.keys(responseData).length) {

                    setFetchedData(responseData.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);


    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="View Design"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Manage Design',
                        href: paths.dashboard.manage_design.root,
                    },
                    { name: "View Design" },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <InvoiceDetails invoice={FetchedData} />
        </Container>
    );
}

InvoiceDetailsView.propTypes = {
    id: PropTypes.string,
};
