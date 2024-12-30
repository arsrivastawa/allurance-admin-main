import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { fCurrency } from 'src/utils/format-number';
import { fTime, fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
const avatarBasePath = '/assets/images/documents/avatar/';
// ----------------------------------------------------------------------

export function RenderCellPrice({ params }) {
  return <>{fCurrency(params.row.price)}</>;
}

RenderCellPrice.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};

// export function RenderCellPublish({ params }) {
//   return (
//     <Label variant="soft" color={(params.row.pair === '1') || 'default'}>
//       {params.row.pair}
//     </Label>
//   );
// }

// export function RenderCellPublish({ params }) {
//   const label = params.row.pair;
//   return <Label variant="soft">{label}</Label>;
// }

// RenderCellPublish.propTypes = {
//   params: PropTypes.shape({
//     row: PropTypes.object,
//   }),
// };

export function RenderCellCreatedAt({ params }) {
  return (
    <ListItemText
      primary={fDate(params.row.created_at)}
      secondary={fTime(params.row.created_at)}
      primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        typography: 'caption',
      }}
    />
  );
}

RenderCellCreatedAt.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};

export function RenderCellStatus({ params }) {
  return (
    <ListItemText
      primary={params.row.status}
      primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        typography: 'caption',
      }}
    />
  );
}

RenderCellStatus.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};

export function RenderCellDOB({ params }) {
  return (
    <ListItemText
      primary={fDate(params.row.date_of_birth)}
      // secondary={fTime(params.row.date_of_birth)}
      primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        typography: 'caption',
      }}
    />
  );
}

RenderCellDOB.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};

export function RenderCellStock({ params }) {
  return (
    <Stack sx={{ typography: 'caption', color: 'text.secondary' }}>
      <LinearProgress
        value={(params.row.available * 100) / params.row.quantity}
        variant="determinate"
        color={
          (params.row.inventoryType === 'out of stock' && 'error') ||
          (params.row.inventoryType === 'low stock' && 'warning') ||
          'success'
        }
        sx={{ mb: 1, height: 6, maxWidth: 80 }}
      />
      {!!params.row.available && params.row.available} {params.row.inventoryType}
    </Stack>
  );
}

RenderCellStock.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};

export function RenderCellName({ params }) {
  var avatarSRC = params.row.avatar ? `${params.row.avatar}` : '';
  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
      <Avatar
        alt={params.row.first_name}
        src={avatarSRC}
        variant="rounded"
        sx={{ width: 64, height: 64, mr: 2 }}
      />

      <ListItemText
        disableTypography
        primary=
        // {
        // <Link
        //   noWrap
        //   color="inherit"
        //   variant="subtitle2"
        //   onClick={params.row.onViewRow}
        //   sx={{ cursor: 'pointer' }}
        // >
        {params.row.first_name + " " + params.row.last_name}
        // </Link>
        secondary={
          < Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
            ID: {params.row.prefix_id} <br />
            Role: {params.row.rolename}
          </Box >
        }
        sx={{ display: 'flex', flexDirection: 'column' }}
      />
    </Stack >
  );
}

RenderCellName.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};

export function RenderCellEmail({ params }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>


      <ListItemText
        disableTypography
        primary=
        // {
        //   <Link
        //     noWrap
        //     color="inherit"
        //     variant="subtitle2"
        //     onClick={params.row.onViewRow}
        //     sx={{ cursor: 'pointer' }}
        //   >
        {params.row.email}
        //   </Link>
        // }
        secondary={
          <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
            {params.row.name1}
          </Box>
        }
        sx={{ display: 'flex', flexDirection: 'column' }}
      />
    </Stack>
  );
}

RenderCellEmail.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};


export function RenderCellPhone({ params }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
      <ListItemText
        disableTypography
        primary=
        // {
        //   <Link
        //     noWrap
        //     color="inherit"
        //     variant="subtitle2"
        //     onClick={params.row.onViewRow}
        //     sx={{ cursor: 'pointer' }}
        //   >
        {params.row.phone}
        //   </Link>
        // }
        secondary={
          <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
            {params.row.name1}
          </Box>
        }
        sx={{ display: 'flex', flexDirection: 'column' }}
      />
    </Stack>
  );
}

// export function RenderStatus({ params }) {
//   return (
//     <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
//       <ListItemText
//         disableTypography
//         primary={
//           <Link
//             noWrap
//             color="inherit"
//             variant="subtitle2"
//             onClick={params.row.onViewRow}
//             sx={{ cursor: 'pointer' }}
//           >
//             {params.row.phone}
//           </Link>
//         }
//         secondary={
//           <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
//             {params.row.name1}
//           </Box>
//         }
//         sx={{ display: 'flex', flexDirection: 'column' }}
//       />
//     </Stack>
//   );
// }
export function RenderStatus({ params }) {
  // Function to determine status label based on status value
  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return "Active";
      case 2:
        return "Banned";
      case 3:
        return "Deleted";
      default:
        return "";
    }
  };

  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
      <ListItemText
        disableTypography
        primary={
          <Link
            noWrap
            color="inherit"
            variant="subtitle2"
            onClick={params.row.onViewRow}
            sx={{ cursor: 'pointer' }}
          >
            {params.row.is_banned === 2 ? (
              <Label variant="soft" color="error">Banned</Label>
            ) : params.row.is_banned === 1 ? (
              <Label variant="soft" color="success">Active</Label>
            ) : null}
            {/* {getStatusLabel(params.row.status)} */}
          </Link>
        }
        sx={{ display: 'flex', flexDirection: 'column' }}
      />
    </Stack>
  );
}


RenderCellPhone.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.object,
  }),
};


