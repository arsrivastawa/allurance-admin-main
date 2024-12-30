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

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  permissions,
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { campaign_name, start_date, till_date, min_cart_value, min_cart_products, discount_percentage, created_at, status, invoiceTo, totalAmount, isfs_length, resin_name, record_status, model_number, manufacturing_piece } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell>
          {campaign_name}
        </TableCell>



        <TableCell>
          {/* <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />122 */}
          {start_date ? fDate(start_date) : "N/A"}
        </TableCell>
        <TableCell>
          {/* <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />122 */}
          {till_date ? fDate(till_date) : "N/A"}
        </TableCell>

        <TableCell>{discount_percentage}</TableCell>
        <TableCell>{min_cart_value}</TableCell>

        {/* <TableCell align="center">{sent}</TableCell>  */}
        <TableCell>
          {min_cart_products}
        </TableCell>

        <TableCell>
          <ListItemText
            primary={created_at ? fDate(created_at) : "N/A"}
            secondary={fTime(created_at)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell>
          {record_status === 1 ? (
            <Label variant="soft" color="warning">Requested</Label>
          ) : record_status === 3 ? (
            <Label variant="soft" color="error">Rejected</Label>
          ) : (
            // Check if the status is "Approved"
            record_status === 2 ? (
              // If Approved, check if it's active
              (new Date() >= new Date(start_date) && new Date() <= new Date(till_date)) && !(new Date() > new Date(till_date)) ? (
                <Label variant="soft" color="info">Active</Label>
              ) : (
                // If not active, check if it's expired
                !(new Date() >= new Date(start_date) && new Date() <= new Date(till_date)) && new Date() > new Date(till_date) ? (
                  <Label variant="soft" color="secondary">Expired</Label>
                ) : (
                  <Label variant="soft" color="success">Approved</Label>
                )
              )
            ) : null // Return null if record_status is not 1, 2, or 3
          )}
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow >

      {
      record_status === 1 &&
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        {/* <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}
        {
          permissions.update_access === 1 &&
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        }

        {/* <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}

        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
        {/* {
          permissions.delete_access === 1 &&
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        } */}
      </CustomPopover>
      }

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
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
