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
import { Select } from '@mui/material';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  permissions,
  userid,
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  users,
  handleAssignUser
}) {
  const { title, created_at, ticket_status, ticket_id, user_type, operate_by, first_name, last_name, email } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemText
            primary={title}
            secondary={ticket_id ? "Ticket Code :" + ticket_id : "N/A"}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell>
          {first_name + " " + last_name}
        </TableCell>
        <TableCell>
          {email}
        </TableCell>
        <TableCell>
          {user_type == 1 ? "Allurance Member" : "New User"}
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

        {operate_by === userid && (
          <TableCell>
            <Label variant="soft" color="info">Assigned to me</Label>
          </TableCell>
        )}
        {!(operate_by === userid) && (
          <TableCell>
            {ticket_status === 1 ? (
              <Label variant="soft" color="warning">Pending</Label>
            ) : ticket_status === 2 ? (
              <Label variant="soft" color="success">Open</Label>
            ) : ticket_status === 3 ? (
              <Label variant="soft" color="error">Closed</Label>
            ) : null}
          </TableCell>
        )}
        {row?.operate_by !== userid && (<>
          <TableCell align="right" sx={{ minWidth: 120, paddingRight: 0 }}>
            <Select
              value={row.operate_by}
              onChange={(event) => handleAssignUser(row.id, event.target.value)}
              sx={{ minWidth: 150 }}
              style={{ width: '100%' }}
            >
              {users?.map((user) => (
                <MenuItem key={user?.id} value={user?.id}>{user?.first_name} {user?.last_name}</MenuItem>
              ))}
            </Select>
          </TableCell>
        </>)}
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow >

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
        {/* {
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
        } */}

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

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
      </CustomPopover>

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
  handleAssignUser: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  users: PropTypes.array,
};
