import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const {
    items,
    invoice_date,
    user_first_name,
    user_last_name,
    total_items,
    total_amount,
    order_id,
    order_status,
    channel_mode,
  } = row;

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>

      <TableCell>
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {order_id || '--'}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          primary={user_first_name + ' ' + user_last_name}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDate(invoice_date) || '--'}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell align="center">
        {' '}
        {(channel_mode === 1 && 'Online') || (channel_mode === 2 && 'Offline') || '--'}{' '}
      </TableCell>

      <TableCell> {total_amount || '--'} /-</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (order_status === 1 && 'warning') ||
            (order_status === 2 && 'success') ||
            (order_status === 3 && 'info') ||
            (order_status === 4 && 'primary') ||
            'default'
          }
        >
          {(order_status === 1 && 'Pending') ||
            (order_status === 2 && 'Placed') ||
            (order_status === 3 && 'Packed') ||
            (order_status === 4 && 'Shipped') ||
            '--'}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>
      </CustomPopover>

    </>
  );
}

OrderTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
};
