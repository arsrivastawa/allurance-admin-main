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

import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Dialog, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import { useState } from 'react';

// ----------------------------------------------------------------------

export default function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const {
    model_number,
    serial_number_data,
    batch_number,
    quantity,
    is_quality_checked_replicator,
    is_packed_replicator,
    category_name,
  } = row;

  console.log(row, 'ROW');

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleViewClick = () => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRow(null);
  };

  const firstRackName = serial_number_data?.find((item) => item.rack_name)?.rack_name || '--';

  const CSV_HEADER = [
    'Serial Number',
    'Quality Check',
    'Packed',
    'Quality Request Id',
    'Box Id',
    'Model Number',
    'Batch Number',
    'Category Name',
    'Rack Name',
  ];

  const downloadCSV = (row) => {
    const data = row.serial_number_data.map((record) => [
      `="${record.serial_number}"`,
      `="${record.is_quality_checked}"`,
      `="${record.is_packed}"`,
      `="${record.quality_request_id}"`,
      `="${record.packing_request_id}"`,
      row.model_number,
      row.batch_number,
      row.category_name,
      record.rack_name,
    ]);
    const csvContent = [CSV_HEADER.join(','), ...data.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Product_box.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell align="center">
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {batch_number || '--'}
        </Box>
      </TableCell>

      <TableCell align="center">
        <ListItemText
          primary={model_number || '--'}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>
      <TableCell align="center"> {category_name || '--'} </TableCell>
      <TableCell align="center"> {firstRackName || '--'} </TableCell>
      <TableCell align="center"> {quantity || '--'} </TableCell>
      <TableCell align="center"> {is_quality_checked_replicator || '--'} </TableCell>
      <TableCell align="center"> {is_packed_replicator || '--'} </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        ></IconButton>
      </TableCell>

      <TableCell>
        <Link
          component="button"
          variant="body2"
          onClick={handleViewClick}
          style={{ color: '#fff' }}
        >
          View
        </Link>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
        <DialogTitle>
          View Details
          {selectedRow?.serial_number_data?.length > 0 && (
            <Button
              variant="contained"
              color="success"
              style={{ float: 'right' }}
              onClick={() => downloadCSV(selectedRow)}
            >
              Download CSV
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedRow && selectedRow.serial_number_data?.length > 0 ? (
            <div>
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  p: 1,
                  bgcolor: 'background.paper',
                  borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                  fontWeight: 'bold',
                }}
              >
                <Box sx={{ flex: 1 }}>Serial Number</Box>
                <Box sx={{ flex: 1 }}>Quality Checked</Box>
                <Box sx={{ flex: 1 }}>Packed</Box>
                <Box sx={{ flex: 1 }}>Quality Request ID</Box>
                <Box sx={{ flex: 1 }}>Box ID</Box>
                <Box sx={{ flex: 1 }}>Category Name</Box>
                <Box sx={{ flex: 1 }}>Rack Name</Box>
              </Stack>

              {selectedRow.serial_number_data?.map((serial, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    '&:not(:last-of-type)': {
                      borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>{serial.serial_number || '--'}</Box>
                  <Box sx={{ flex: 1 }}>{serial.is_quality_checked || '--'}</Box>
                  <Box sx={{ flex: 1 }}>{serial.is_packed || '--'}</Box>
                  <Box sx={{ flex: 1 }}>{serial.quality_request_id || '--'}</Box>
                  <Box sx={{ flex: 1 }}>{serial.packing_request_id || '--'}</Box>
                  <Box sx={{ flex: 1 }}>{selectedRow.category_name || '--'}</Box>
                  <Box sx={{ flex: 1 }}>{serial.rack_name || '--'}</Box>
                </Stack>
              ))}
            </div>
          ) : (
            <div>
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  p: 1,
                  bgcolor: 'background.paper',
                  borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                  fontWeight: 'bold',
                }}
              >
                <Box sx={{ flex: 1 }}>Serial Number</Box>
                <Box sx={{ flex: 1 }}>Quality Checked</Box>
                <Box sx={{ flex: 1 }}>Packed</Box>
                <Box sx={{ flex: 1 }}>Quality Request ID</Box>
                <Box sx={{ flex: 1 }}>Box ID</Box>
                <Box sx={{ flex: 1 }}>Category Name</Box>
                <Box sx={{ flex: 1 }}>Rack Name</Box>
              </Stack>
              <Typography
                variant="body2"
                sx={{ textAlign: 'center', color: 'text.primary', marginBottom: 4, marginTop: 2 }}
              >
                No Data Available
              </Typography>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
