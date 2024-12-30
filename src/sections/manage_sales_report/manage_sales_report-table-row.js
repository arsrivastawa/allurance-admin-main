import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const {
    invoice_date,
    payment_type,
    payment_status,
    order_status,
    channel_mode,
  } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ noWrap: true }}>
          <ListItemText primary={row.order_id || '--'} primaryTypographyProps={{ noWrap: true }} />
        </TableCell>

        <TableCell>
          {order_status === 1 ? (
            <Label variant="soft" color="warning">
              Pending
            </Label>
          ) : order_status === 2 ? (
            <Label variant="soft" color="info">
              Packed
            </Label>
          ) : order_status === 3 ? (
            <Label variant="soft" color="primary">
              Placed
            </Label>
          ) : order_status === 4 ? (
            <Label variant="soft" color="success">
              Shipped
            </Label>
          ) : null}
        </TableCell>

        <TableCell>
          {payment_type === 1 ? (
            <Label variant="soft">Cash</Label>
          ) : payment_type === 2 ? (
            <Label variant="soft">UPI</Label>
          ) : payment_type === 3 ? (
            <Label variant="soft">Credit/Debit</Label>
          ) : payment_type === 4 ? (
            <Label variant="soft">Gift Card</Label>
          ) : (
            '--'
          )}
        </TableCell>

        <TableCell>
          {payment_status === 1 ? (
            <Label variant="soft" color="warning">
              Pending
            </Label>
          ) : payment_status === 2 ? (
            <Label variant="soft" color="success">
              Success
            </Label>
          ) : payment_status === 3 ? (
            <Label variant="soft" color="info">
              Failed
            </Label>
          ) : (
            '--'
          )}
        </TableCell>

        <TableCell>
          {channel_mode === 1 ? (
            <Label variant="soft">Online</Label>
          ) : channel_mode === 2 ? (
            <Label variant="soft">Offline</Label>
          ) : (
            '--'
          )}
        </TableCell>
        
        <TableCell>
          <ListItemText
            primary={fDate(invoice_date)}
            // secondary={fTime(created_at)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

      </TableRow>

    </>
  );
}

InvoiceTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
