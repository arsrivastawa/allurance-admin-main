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
  onAddRow,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { category_name, created_at, dueDate, status, invoiceTo, totalAmount, isfs_length, resin_name, marketing_product_record_status, model_number, manufacturing_piece } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}
        <TableCell>
          <ListItemText
            primary={category_name}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        {/* <TableCell>{fCurrency(totalAmount)}</TableCell>

        <TableCell align="center">{sent}</TableCell> */}



        <TableCell sx={{ px: 1 }}>
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
          {model_number}
        </TableCell>
        <TableCell>
          <ListItemText
            primary={fDate(created_at)}
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
          {marketing_product_record_status === 2 ? (
            <Label variant="soft" color="warning">Requested</Label>
          ) : marketing_product_record_status === 1 ? (
            <Label variant="soft" color="success">Approved</Label>
          ) : marketing_product_record_status === 3 ? (
            <Label variant="soft" color="error">Rejected</Label>
          ) : <Label variant="soft" color="info">Pending Creation</Label>}
        </TableCell>
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow >

      {/* {marketing_product_record_status != 1 && ( */}
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 160 }}
        >
          {!marketing_product_record_status == 1 && (
            <MenuItem
              onClick={() => {
                onAddRow();
                popover.onClose();
              }}
            >
              <Iconify icon="carbon:add-filled" />
              Create
            </MenuItem>
          )}

          {/* <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:add-filled" />
          <Iconify icon="solar:eye-bold" />
          Details
        </MenuItem> */}
          {
            // permissions.update_access === 1 && marketing_product_record_status != 0 && marketing_product_record_status != 1
            permissions.update_access === 1 && marketing_product_record_status != 0 && marketing_product_record_status != 3
            &&
            < MenuItem
              onClick={() => {
                onEditRow();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>
          }

          {/* <Divider sx={{ borderStyle: 'dashed' }} />
        {
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
        </CustomPopover >
      {/* // )} */}
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
  onAddRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
