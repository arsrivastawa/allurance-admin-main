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

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { useState } from 'react';
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
  const { category_name, request_id, quantity, created_at, totalCount, record_status, model_number, batch_number, numer_of_request } = row;

  const confirm = useBoolean();

  const popover = usePopover();


  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleViewClick = () => {
    setSelectedRow(row); // Store the row data
    setOpenDialog(true); // Open the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const CSV_HEADER = ['Batch Number', 'Quality Check Number', 'Model Number', 'Category', 'Serial Number'];

  const downloadCSV = (row) => {
    const data = row.records.map(record => [row.batch_number, `="${record.quality_checked_number}"`, row.model_number, record.category_name, `="${record.serial_number}"`]);
    const csvContent = [
      CSV_HEADER.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Product_box.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup the DOM.
  };

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

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
        <TableCell>{request_id ? request_id : "-"}</TableCell>
        <TableCell>{numer_of_request ? numer_of_request : "-"}</TableCell>
        <TableCell>{model_number ? model_number : "-"}</TableCell>
        <TableCell>{batch_number ? batch_number : "-"}</TableCell>
        <TableCell>
          <Link component="button" variant="body2" onClick={handleViewClick} style={{ color: '#fff' }}>
            View
          </Link>
        </TableCell>
        <TableCell align="right" sx={{ px: 1 }}>
          {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </TableCell>

      </TableRow >

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth >
        <DialogTitle>View Details
          <Button variant="contained" onClick={() => downloadCSV(selectedRow)} color="success" style={{ float: 'right' }}>Download CSV</Button>
        </DialogTitle>
        <DialogContent>
          {selectedRow && (
            <div>
              <Typography variant="body2">Box TItle: {selectedRow.request_id}</Typography>
              <Typography variant="body2">Batch Number: {selectedRow.batch_number}</Typography>
              <Typography variant="body2">Number Of Records: {selectedRow.numer_of_request}</Typography>
              <table style={{ marginTop: '20px', marginBottom: '30px', fontSize: '14px', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>#</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Serial Number</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Authenticity Card Number</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Model Number</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Serial Number</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRow?.records?.map((record, index) => (
                    <tr key={record?.id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record?.serial_number}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record?.quality_checked_number}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record?.model_number}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record?.category_name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record?.serial_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      /> */}
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
