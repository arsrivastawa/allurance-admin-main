import { _mock } from 'src/_mock';

// TO GET THE USER FROM THE AUTHCONTEXT, YOU CAN USE

// CHANGE:
// import { useMockedUser } from 'src/hooks/use-mocked-user';
// const { user } = useMockedUser();

// TO:
// import { useAuthContext } from 'src/auth/hooks';
// const { user } = useAuthContext();

import { jwtDecode } from '../auth/context/jwt/utils';

const STORAGE_KEY = 'accessToken';
let accessToken;

// Check if sessionStorage is available before trying to access it
if (typeof sessionStorage !== 'undefined') {
  accessToken = sessionStorage.getItem(STORAGE_KEY);
  // Check if accessToken is not undefined before decoding
} else {
  console.error("sessionStorage is not available in this environment.");
}


let decoded;
if (accessToken != null && accessToken !== undefined) {
  decoded = jwtDecode(accessToken);
} else {
  // console.error("accessToken is undefined. Cannot decode.");
}

// ----------------------------------------------------------------------

// export function useMockedUser() {
//   const firstName = decoded?.data?.first_name;
//   const lastName = decoded?.data?.last_name;
//   const fullName = `${firstName || ''} ${lastName || ''}`.trim();

//   const user = {
//     id: decoded?.data?.id,
//     displayName: fullName,
//     email: decoded?.data?.email,
//     password: 'demo1234',
//     photoURL: _mock.image.avatar(24),
//     phoneNumber: decoded?.data?.phone,
//     country: 'United States',
//     address: '90210 Broadway Blvd',
//     state: 'California',
//     city: 'San Francisco',
//     zipCode: '94116',
//     about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
//     role: 'admin',
//     isPublic: true,
//   };

//   return { user };
// }


export function useMockedUser() {
  const firstName = decoded?.data?.first_name;
  const lastName = decoded?.data?.last_name;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  const user = {
    id: decoded?.data?.id,
    role_id: decoded?.data?.role_id,
    displayName: fullName,
    email: decoded?.data?.email,
    prefix_id: decoded?.data?.prefix_id,
    password: 'demo1234',
    photoURL: _mock.image.avatar(24),
    phoneNumber: decoded?.data?.phone,
    country: 'United States',
    address: '90210 Broadway Blvd',
    state: 'California',
    city: 'San Francisco',
    zipCode: '94116',
    about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
    role: 'admin',
    isPublic: true,
  };

  return { user };
}
