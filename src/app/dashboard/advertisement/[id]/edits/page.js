import PropTypes from 'prop-types';

import { _userList } from 'src/_mock/_user';

import { UserEditViews } from 'src/sections/advertisement/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Review System: Advertisement Edit',
};

export default function UserEditPage({ params }) {
  const { id } = params;

  return <UserEditViews id={id} />;
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
