'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PaymentPage from '../manage_sales-checkout';

// ----------------------------------------------------------------------

export default function Checkout() {
    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Checkout"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    // {
                    //   name: 'Sell',
                    //   href: paths.dashboard.manage_sales.root,
                    // },
                    { name: 'Checkout' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <PaymentPage />
        </Container>
    );
}



