// 'use client';

// import Container from '@mui/material/Container';

// import { paths } from 'src/routes/paths';

// import { useSettingsContext } from 'src/components/settings';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import UserNewEditForm from '../pages-new-edit-form';

// // ----------------------------------------------------------------------

// export default function UserCreateView() {
//   const settings = useSettingsContext();

//   return (
//     <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//       <CustomBreadcrumbs
//         heading="Create a new Pages"
//         links={[
//           {
//             name: 'Dashboard',
//             href: paths.dashboard.root,
//           },
//           {
//             name: 'Pages',
//             href: paths.dashboard.pages.list,
//           },
//           { name: 'New Pages' },
//         ]}
//         sx={{
//           mb: { xs: 3, md: 5 },
//         }}
//       />

//       <UserNewEditForm />
//     </Container>
//   );
// }
