// findreplicationmodel-list-oview.js
'use client';

import sumBy from 'lodash/sumBy';
import { useState, useCallback } from 'react';
import * as Yup from 'yup';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';

import { _invoices, INVOICE_SERVICE_OPTIONS } from 'src/_mock';

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


import InvoiceTableRow from '../replicate1-table-row';
import InvoiceTableToolbar from '../replicate-table-toolbar';
import InvoiceTableFiltersResult from '../replicate-table-filters-result';
import { DESIGNER_ENDPOINT } from 'src/utils/apiEndPoints';
import { fetchDataFromApi } from '../../../utils/commonFunction';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Title' },
  { id: 'dueDate', label: 'Pieces Manufacture' },
  { id: 'category_id', label: 'Pieces Sold' },
  { id: 'category_name', label: 'Category' },
  { id: 'resin_name', label: 'Resin Type' },
  { id: 'model_number', label: 'Model Number' },

  { id: 'created_at', label: 'Create' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const { enqueueSnackbar } = useSnackbar();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();

  const designerData = async () => {
    try {
      const apiUrl = DESIGNER_ENDPOINT;
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setTableData(responseData); // Set the response data to the tableData state
      }
    } catch (error) {
      console.error("Error fetching designer data:", error);
    }
  };

  useEffect(() => {
    designerData();
  }, []);

  // const [tableData, setTableData] = useState(_invoices);
  const [tableData, setTableData] = useState([]); // Initialize with an empty array


  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

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
    !!filters.name ||
    !!filters.service.length ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getInvoiceLength = (status) => tableData.filter((item) => item.status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalAmount'
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    {
      value: 'paid',
      label: 'Approved',
      color: 'success',
      count: getInvoiceLength('paid'),
    },
    {
      value: 'pending',
      label: 'Pending',
      color: 'warning',
      count: getInvoiceLength('pending'),
    },
    {
      value: 'overdue',
      label: 'Rejected',
      color: 'error',
      count: getInvoiceLength('overdue'),
    },
  ];

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id) => {

      const deleteRow = tableData.filter((row) => row.id !== id);

      const apiUrl = `${DESIGNER_ENDPOINT}?id=${id}`;
      const responseData = await fetchDataFromApi(apiUrl, 'DELETE');
      if (responseData) { 
        // console.log("delete responseData", responseData); 
      }

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {

    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    const deletedIds = table.selected.join(',');
    const apiUrl = `${DESIGNER_ENDPOINT}?ids=${deletedIds}`;
    const responseData = await fetchDataFromApi(apiUrl, 'DELETE');

    enqueueSnackbar('Delete success!');

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.findreplicationmodel.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.findreplicationmodel.details('e99f09a7-dd88-49d5-b1c8-1daf80c2d7b20'));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const NewProductSchema = Yup.object().shape({
    quantity: Yup.number().required('Quantity is required').positive('Quantity must be a positive number').integer('Quantity must be an integer'),
  });
  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
  });

  const handleCreateReplication = useCallback(
    (id) => {
      router.push(paths.dashboard.findreplicationmodel.replicate(id));
    },
    [router]
  );

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit1 = handleSubmit(async (data) => {
    try {
      const payload = {
        designer_id: data.id,
        quantity: data.quantity,
      };

      const response = await ManageAPIsData(REPLICATOR_ENDPOINT, 'POST', payload);

      if (response.ok) {
        enqueueSnackbar('Replication success!');
        router.push(paths.dashboard.findreplicationmodel.root);
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
        [dataInPage.length, enqueueSnackbar, table, tableData]
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Find Replication"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Find Replication',
              href: paths.dashboard.findreplicationmodel.root,
            },
            {
              name: 'List',
            },
          ]}
          // action={
          //   <Button
          //     component={RouterLink}
          //     href={paths.dashboard.findreplicationmodel.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="mingcute:add-line" />}
          //   >
          //     New Replicate
          //   </Button>
          // }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />



        <Card>
          {/* <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs> */}

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
          />

          {canReset && (
            <InvoiceTableFiltersResult
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
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
              action={
                <Stack direction="row">
                  {/* <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip> */}

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onCreate={() => handleCreateReplication(row.model_number)}
                        onView={() => handleOpenModal(row)}
                      // onEditRow={() => handleEditRow(row.id)}
                      // onDeleteRow={() => handleDeleteRow(row.id)}
                      // onDeleteRow={() => onSubmit1(row)}
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
  const { name, status, service, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);
;

  if (name) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.title.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.resin_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.category_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.model_number?.toLowerCase().indexOf(name.toLowerCase()) !== -1 // Add search filter for model_number field
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((filterItem) => service.includes(filterItem.service))
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice) => isBetween(invoice.created_at, startDate, endDate));
    }
  }

  return inputData;
}
