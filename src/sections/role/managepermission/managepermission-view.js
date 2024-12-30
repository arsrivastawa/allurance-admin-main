'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../managepermission-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Manage Permission"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Manage Permission',
                        href: paths.dashboard.role.managepermission,
                    },
                    { name: 'list' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ProductNewEditForm />
        </Container>
    );
}
