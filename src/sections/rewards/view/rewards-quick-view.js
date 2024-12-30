// 'use client';

// import PropTypes from 'prop-types';

// import Container from '@mui/material/Container';

// import { paths } from 'src/routes/paths';

// import { useSettingsContext } from 'src/components/settings';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import UserNewEditForm from '../rewards-quick-edit-form';
// import { UsegetReward } from 'src/api/rewards';

// // ----------------------------------------------------------------------

// export default function UserEditView({ id }) {
//   const settings = useSettingsContext();
//   const { product: currentRewards } = UsegetReward(id);
//   return (
//     <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//       <UserNewEditForm currentRewards={currentRewards} />
//     </Container>
//   );
// }

// UserEditView.propTypes = {
//   id: PropTypes.string,
// };
