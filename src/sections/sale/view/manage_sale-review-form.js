'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductListing from '../manage_sales-product-fetch-page';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Products"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    // {
                    //   name: 'Sell',
                    //   href: paths.dashboard.manage_sales.root,
                    // },
                    { name: 'Products' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ProductListing />
        </Container>
    );
}



