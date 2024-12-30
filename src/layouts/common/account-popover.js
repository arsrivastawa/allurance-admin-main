import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';

import { varHover } from 'src/components/animate';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useEffect, useState } from 'react';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { USER_ENDPOINT } from 'src/utils/apiEndPoints';

// ----------------------------------------------------------------------

const OPTIONS = [
  // {
  //   label: 'Home',
  //   linkTo: '/',
  // },
  {
    label: 'Profile',
    linkTo: paths.dashboard.settings.myprofile,
  },
  // {
  //   label: 'Settings',
  //   linkTo: paths.dashboard.user.account,
  // },
];

// ----------------------------------------------------------------------

export default function AccountPopover({ userNameInfo }) {
  const router = useRouter();
  const [UserProfile, setUserProfile] = useState([]);
  const [UserData, setUserData] = useState([]);

  const { user } = useMockedUser();

  const getListingData = async () => {
    try {
      const response = await ManageAPIsData(`${USER_ENDPOINT}?id=${user.id}`, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      setUserProfile(responseData?.data?.avatar);
      setUserData(responseData?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getListingData();
  }, []);

  const { logout } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/admin/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path) => {
    popover.onClose();
    router.push(path);
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={UserProfile}
          alt={UserProfile?.first_name}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {UserData?.first_name?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>{UserData && (
            userNameInfo
          )}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.prefix_id}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
