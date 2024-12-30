import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate, fTime } from 'src/utils/format-time';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  row,
  selected,
  onDeleteRow,
}) {
  const { rack_code, created_at, rack_title, count } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <ListItemText
            primary={rack_title}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell sx={{ px: 1 }}>
          {rack_code}
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
          {count}
        </TableCell>
        <TableCell align="right" sx={{ px: 1 }}>
          {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </TableCell>
      </TableRow >

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
