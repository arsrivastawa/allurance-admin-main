'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../activitylog-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
    const settings = useSettingsContext();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Activity Log"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Settings',
                        href: paths.dashboard.settings.activitylog,
                    },
                    { name: 'Activity Log' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <ProductNewEditForm />
        </Container>
    );
}
