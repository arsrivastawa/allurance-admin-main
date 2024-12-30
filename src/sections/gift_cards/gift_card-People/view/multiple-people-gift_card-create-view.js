'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../multiple-people-gift_card-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a New Multiple Cards for People "
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Gift Cards',
          },
          {
            name: 'Multiple for People',
            href: paths.dashboard.people_gift_card.root,
          },
          { name: 'New Card ' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm />
    </Container>
  );
}



