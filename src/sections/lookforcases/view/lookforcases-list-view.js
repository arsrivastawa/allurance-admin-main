// manage_design-list-oview.js
'use client';

import sumBy from 'lodash/sumBy';
import { useState, useCallback, useEffect } from 'react';

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
  TableHeadCustoms,
} from 'src/components/table';

import InvoiceAnalytic from '../lookforcases-analytic';
import InvoiceTableRow from '../lookforcases-table-row';
import InvoiceTableToolbar from '../lookforcases-table-toolbar';
import InvoiceTableFiltersResult from '../lookforcases-table-filters-result';
import { SUPPORT_CHANNEL_ROLE_ID, TICKET_ASSIGN_ENDPOINT, TICKETS_ENDPOINT, USER_ENDPOINT } from '../../../utils/apiEndPoints';
import { fetchDataFromApi, ManageAPIsData } from '../../../utils/commonFunction';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { TableHead, TablePagination } from '@mui/material';
// ----------------------------------------------------------------------



const defaultFilters = {
  name: '',
  service: [],
  status: 'myCases',
  startDate: null,
  endDate: null,
};

// Define the initial TABLE_HEAD state
const initialTableHead = [
  { id: 'title', label: 'Title' },
  { id: 'dueDate', label: 'User Name' },
  { id: 'user_type', label: 'Email' },
  { id: 'user_type', label: 'User Type' },
  { id: 'created_at', label: 'Create' },
  { id: 'status', label: 'Status' },
  { id: 1, label: '' },
];


// ----------------------------------------------------------------------

export default function InvoiceListView(permissions) {
  const { add_access, update_access, delete_access } = permissions.permissions;
  const [userid, Setuserid] = useState('');
  const [currentStatus, setCurrentStatus] = useState('myCases');
  const [users, setUsers] = useState([]);
  const [TABLE_HEAD, setTableHead] = useState(initialTableHead);
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();

  const FetchTickets = async () => {
    try {
      const apiUrl = TICKETS_ENDPOINT;
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setTableData(responseData); // Set the response data to the tableData state
      }
    } catch (error) {
      console.error("Error fetching designer data:", error);
    }
  };

  const updateTableHead = (status) => {
    const newTableHead = [...initialTableHead]; // Start with the initial table head

    // Conditionally remove the object with id equal to 1 when the status is 'open'
    if (status === 'open') {
      const filteredTableHead = newTableHead.filter(item => item.id !== 1);
      setTableHead([...filteredTableHead, { id: 'assignedTo', label: 'Assign to' }, { id: '', label: '' }]);
    } else {
      // If status is not 'open', update the TABLE_HEAD state with the original table head
      setTableHead(newTableHead);
    }
  };

  const handleTabChange = (event, newValue) => {
    // console.log("newValuenewValuenewValue", event);
    setCurrentStatus(newValue);
    updateTableHead(event);
  };


  const FetchUserDetails = async () => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    if (!accessToken) {
      // console.error("accessToken is undefined. Cannot decode.");
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      const userdata = decoded?.data;
      if (userdata) {
        Setuserid(userdata?.id);
      } else {
        console.error("Role ID not found in decoded token.");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  useEffect(() => {
    FetchTickets();
    FetchUserDetails();
  }, []);

  const [tableData, setTableData] = useState([]); // Initialize with an empty array

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
    userid, // Pass the userid here
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

  const getInvoiceLength = (status) => {
    if (status === 'myCases') {
      return tableData.filter((item) => item.operate_by === userid).length;
    }
    // For other statuses, exclude items where `operate_by` equals `userid`
    return tableData.filter((item) => item.ticket_status === status && item.operate_by !== userid).length;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await fetchDataFromApi(USER_ENDPOINT, 'GET');
        const filteredUsers = usersData.filter(user => user?.role_id === SUPPORT_CHANNEL_ROLE_ID);
        // console.log("filteredUsers", filteredUsers);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const TABS = [
    { value: 'myCases', label: 'My Cases', color: 'info', count: getInvoiceLength('myCases') }, // New tab
    // { value: 'all', label: 'All', color: 'default', count: tableData.length },
    // { value: 'pending', label: 'Pending', color: 'warning', count: getInvoiceLength(1) },
    { value: 'open', label: 'Open', color: 'success', count: getInvoiceLength(2) },
    { value: 'closed', label: 'Closed', color: 'error', count: getInvoiceLength(3) },
  ];

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      // Check if the filter is for 'status' (tabs filter)
      if (name === 'status') {
        // Update the 'status' property of the filters object
        setFilters((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      } else {
        // For other filters, update the corresponding filter in the state
        setFilters((prevState) => ({
          ...prevState,
          name: value,
        }));
      }
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      const apiUrl = `${TICKETS_ENDPOINT}?id=${id}`;
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
    const apiUrl = `${TICKETS_ENDPOINT}?ids=${deletedIds}`;
    const responseData = await fetchDataFromApi(apiUrl, 'DELETE');

    enqueueSnackbar('Delete success!');

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.lookforcases.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.lookforcases.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
      handleTabChange(newValue);
    },
    [handleFilters]
  );

  const handleAssignUser = async (rowId, assignedto_id) => {
    // console.log(`Assigning row ${rowId} to user ${assignedto_id} the user who did is ${userid} `);
    try {
      // Handle Image Process
      const data = {
        operate_by: assignedto_id,
        assign_by: userid, s
      };
      const apiUrl = `${TICKET_ASSIGN_ENDPOINT}?id=${rowId}`;
      const fetchMethod = "PUT";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar('Assign success!');
        FetchTickets();
      } else {
        enqueueSnackbar(response.error, { variant: 'error' });
      }

    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Look For Cases"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'look for cases',
              href: paths.dashboard.lookforcases.root,
            },
            {
              name: 'List',
            },
          ]}
          action={add_access === 1 && (<></>
            // <Button
            //   component={RouterLink}
            //   href={paths.dashboard.lookforcases.new}
            //   variant="contained"
            //   startIcon={<Iconify icon="mingcute:add-line" />}
            // >
            //   Add New
            // </Button>
          )}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Label color={tab.color}> {tab.count} </Label>}
              />
            ))}
          </Tabs>

          <Divider />

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            canReset={canReset}
            onResetFilter={handleResetFilters}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <>
                  {delete_access === 1 && (
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={handleDeleteRows}>
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              }
            />

            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustoms
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered.length > 0 ? (
                  dataInPage.map((row) => (
                    <InvoiceTableRow
                      userid={userid}
                      key={row.id}
                      selected={table.selected.includes(row.id)}
                      row={row}
                      users={users} // Pass the list of users
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      handleAssignUser={handleAssignUser}
                    />
                  ))
                ) : (
                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)} />
                )}

                <TableNoData isNotFound={notFound} />
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------
const applyFilter = ({ inputData, comparator, filters, dateError, userid }) => {
  let filteredData = [...inputData];

  if (filters.status !== 'all') {
    if (filters.status === 'myCases') {
      filteredData = filteredData.filter((invoice) => invoice.operate_by === userid);
    } else {
      filteredData = filteredData.filter((invoice) => invoice.operate_by !== userid);
      let filterInvoicesByStatus;
      if (filters.status === 'pending') {
        filterInvoicesByStatus = 1;
      }
      if (filters.status === 'open') {
        filterInvoicesByStatus = 2;
      }
      if (filters.status === 'closed') {
        filterInvoicesByStatus = 3;
      }
      filteredData = filteredData.filter((invoice) => invoice.ticket_status === filterInvoicesByStatus);
    }
  }

  filteredData.sort(comparator);

  if (filters.name) {
    filteredData = filteredData.filter((invoice) =>
      invoice.title.toLowerCase().includes(filters.name.toLowerCase())
    );
  }

  if (filters.startDate && filters.endDate && !dateError) {
    filteredData = filteredData.filter((invoice) =>
      isBetween(invoice.dueDate, filters.startDate, filters.endDate)
    );
  }

  return filteredData;
};
