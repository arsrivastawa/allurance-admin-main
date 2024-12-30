import PropTypes from 'prop-types';

import { _userList } from 'src/_mock/_user';
import UserDetailsView from 'src/sections/rewards/view/rewards-import-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Review System: Import CSV file',
};

export default function UserEditPage({ params }) {
  const { id } = params;

  return <UserDetailsView id={id} />;
}

export async function generateStaticParams() {
  return _userList.map((user) => ({
    id: user.id,
  }));
}

UserEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
