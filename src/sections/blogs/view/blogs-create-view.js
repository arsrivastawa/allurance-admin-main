'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useRouter } from 'src/routes/hooks';
import ProductNewEditForm from '../blogs-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Blog"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Blogs',
            href: paths.dashboard.blogs.root,
          },
          { name: 'New Blog' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm />
    </Container>
  );
}
