'use client';

import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';

import { _orders, ORDER_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import OrderTableRow from '../advertisement-table-row';
import OrderTableToolbar from '../advertisement-table-toolbar';
import OrderTableFiltersResult from '../advertisement-table-filters-result';
import { endpoints } from 'src/utils/axios';
import axios from 'axios';
import { DeleteAdvertisement, DeleteMultipleAdvertisement } from 'src/api/advertisement';
import { RouterLink } from 'src/routes/components';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...ORDER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'title', label: 'Title' },
  { id: 'start_date', label: 'Start date' },
  { id: 'end_date', label: 'End date' },
  { id: 'company_category_name', label: 'Company category' },
  { id: 'type', label: 'Type' },
  { id: 'ad_counter', label: 'Ad Click' },
  { id: 'record_status_name', label: 'Status' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  record_status_name: 'all',
  start_date: null,
  end_date: null,
};
// ----------------------------------------------------------------------

export default function OrderListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.start_date, filters.end_date);

  const start_date = new Date(filters.start_date);
  const end_date = new Date(filters.end_date);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset =
    !!filters.title ||
    filters.record_status_name !== 'all' ||
    (!!filters.start_date && !!filters.end_date);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.advertisement.list);
        setTableData(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await DeleteAdvertisement(id);
        const deleteRow = tableData.filter((row) => row.id !== id);

        enqueueSnackbar('Delete success!');

        setTableData(deleteRow);
      } catch (error) {
        enqueueSnackbar('Delete failed!', { variant: 'error' });
        console.error(error);
      }
    },
    [enqueueSnackbar, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const selectedIds = table.selected;
      await DeleteMultipleAdvertisement(selectedIds);
      const updatedTableData = tableData.filter((row) => !selectedIds.includes(row.id));
      enqueueSnackbar('Delete success!');
      setTableData(updatedTableData);
      table.onUpdatePageDeleteRows({
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
    } catch (error) {
      enqueueSnackbar('Delete failed!', { variant: 'error' });
      console.error('Error deleting data:', error);
    }
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.advertisement.edit(id));
    },
    [router]
  );

  const handleEditRow1 = useCallback(
    (id) => {
      router.push(paths.dashboard.advertisement.edits(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.advertisement.view(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('record_status_name', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Advertisement',
              href: paths.dashboard.advertisement.list,
            },
            { name: 'List' },
          ]}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {' '}
              <Button
                component={RouterLink}
                href={paths.dashboard.advertisement.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Create default ad
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.advertisement.ads}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Create Ad
              </Button>
            </Box>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.record_status_name}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.record_status_name) &&
                        'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'Approved' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'Rejected' && 'error') ||
                      'default'
                    }
                  >
                    {['Approved', 'Pending', 'Rejected'].includes(tab.value)
                      ? tableData.filter((user) => user.record_status_name === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <OrderTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onEditRow1={() => handleEditRow1(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { title, record_status_name, description, start_date, end_date } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (title) {
    inputData = inputData.filter((order) =>
      order.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  if (record_status_name !== 'all') {
    inputData = inputData.filter((order) => order.record_status_name === record_status_name);
  }

  if (!dateError && start_date && end_date) {
    const startDateWithTime = new Date(start_date);
    startDateWithTime.setHours(0, 0, 0, 0);

    const endDateWithTime = new Date(end_date);
    endDateWithTime.setHours(23, 59, 59, 999);

    inputData = inputData.filter((order) => {
      const orderStartDate = new Date(order.start_date);
      const orderEndDate = new Date(order.end_date);

      return orderStartDate >= startDateWithTime && orderEndDate <= endDateWithTime;
    });
  }

  return inputData;
}
