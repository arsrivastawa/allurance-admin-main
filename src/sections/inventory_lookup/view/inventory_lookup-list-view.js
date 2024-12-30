'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ManageAPIsData } from '../../../utils/commonFunction';
import { MANAGE_BATCHES } from '../../../utils/apiEndPoints';
import ProductTableFiltersResult from '../inventory_lookup-table-filters-result';
import {
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
} from '../inventory_lookup-table-row';
import { TextField } from '@mui/material';

// ----------------------------------------------------------------------

// Define the metadata
export const metadata = {
  title: 'Dashboard: Category List',
};

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function ProductListView(permissions) {
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);
  const [batchNumber, setBatchNumber] = useState('');

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  // Listing data

  const handleBatchNumberChange = (event) => {
    setBatchNumber(event.target.value);
  };

  const fetchBatchData = async () => {
    try {
      const payload = { batch_number: batchNumber };
      const response = await ManageAPIsData(MANAGE_BATCHES, 'POST', payload);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        enqueueSnackbar('Failed to fetch data', { variant: 'error' });
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setTableData(responseData.data);
      } else {
        setTableData([]);
        enqueueSnackbar('No data found for the entered batch number', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      enqueueSnackbar('Error fetching data', { variant: 'error' });
    }
  };
  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);



  const dataFilteredWithIndex = dataFiltered.map((row, index) => ({
    ...row,
    serial_number_index: index + 1, 
  }));

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    if (batchNumber.trim() !== '') {
      fetchBatchData();
    }
  }, [batchNumber]);

  const columns = [
    {
      field: 'serial_number_index',
      headerName: 'S.No',
      sortable: false,
      width: 80,
    },
    {
      field: 'serial_number',
      headerName: 'Serial Number',
      flex: 1,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      flex: 1,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      field: 'serial_number_status',
      headerName: 'Status',
      flex: 1,
      type: 'singleSelect',
      editable: false,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Inventory Lookup',
              href: paths.dashboard.inventory_lookup.root,
            },
            { name: 'List' },
          ]}
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Card
          sx={{
            height: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            label="Enter Batch Number"
            variant="outlined"
            fullWidth
            value={batchNumber}
            onChange={handleBatchNumberChange}
            sx={{ mb: 3, }}
          />
          <DataGrid
            disableRowSelectionOnClick
            rows={dataFilteredWithIndex}
            columns={columns}
            loading={false}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: () => (
                <>
                  <GridToolbarContainer>
                    <GridToolbarQuickFilter />

                    <Stack
                      spacing={1}
                      flexGrow={1}
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarExport />
                    </Stack>
                  </GridToolbarContainer>

                  {canReset && (
                    <ProductTableFiltersResult
                      filters={filters}
                      onFilters={handleFilters}
                      onResetFilters={handleResetFilters}
                      results={dataFiltered.length}
                      sx={{ p: 2.5, pt: 0 }}
                    />
                  )}
                </>
              ),
              noRowsOverlay: () => <EmptyContent title="No Data" />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              columnsPanel: {
                getTogglableColumns,
              },
            }}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
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

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}
