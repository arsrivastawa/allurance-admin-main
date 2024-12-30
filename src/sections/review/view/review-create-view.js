// 'use client';

// import Container from '@mui/material/Container';

// import { paths } from 'src/routes/paths';

// import { useSettingsContext } from 'src/components/settings';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import UserNewEditForm from '../review-new-edit-form';

// // ----------------------------------------------------------------------

// export default function UserCreateView() {
//   const settings = useSettingsContext();

//   return (
//     <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//       <CustomBreadcrumbs
//         heading="Create a new Category"
//         links={[
//           {
//             name: 'Dashboard',
//             href: paths.dashboard.root,
//           },
//           {
//             name: 'Category',
//             href: paths.dashboard.category.list,
//           },
//           { name: 'New Category' },
//         ]}
//         sx={{
//           mb: { xs: 3, md: 5 },
//         }}
//       />

//       <UserNewEditForm />
//     </Container>
//   );
// }
