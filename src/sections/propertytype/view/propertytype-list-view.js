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
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
import { deletePropertytype, UsegetPropertiesType } from 'src/api/propertytype';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductTableToolbar from '../propertytype-table-toolbar';
import ProductTableFiltersResult from '../propertytype-table-filters-result';
import {
  RenderCellProduct,
  RenderCellCreatedAt,
  RenderCelldescription,
} from '../propertytype-table-row';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function ProductListView() {
  const { enqueueSnackbar } = useSnackbar();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const confirmRows = useBoolean();
  const router = useRouter();
  const settings = useSettingsContext();
  const { products, productsLoading } = UsegetPropertiesType();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  useEffect(() => {
    if (products.length) {
      setTableData(products);
    }
  }, [products]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      setConfirmDeleteId(id); // Set the ID for confirmation
    },
    []
  );

  const handleDeleteRowById = useCallback(
    async (id) => {
      try {
        await deletePropertytype(id); // Assuming deleteRole is an API function that deletes the role by ID
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

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.propertytype.edit(id));
    },
    [router]
  );

  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      filterable: false,
    },
    {
      field: 'property_type',
      headerName: 'Property type',
      flex: 1,
      minWidth: 40,
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 400,
      editable: true,
      renderCell: (params) => <RenderCelldescription params={params} />,
    },
    {
      field: 'created',
      headerName: 'Created at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
        key={`edit-${params.row.id}`}
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
        key={`delete-${params.row.id}`}
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
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
              name: 'Property type',
              href: paths.dashboard.propertytype.root,
            },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.propertytype.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Create
            </Button>
          }
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Card
          sx={{
            height: { xs: 800, md: 2 },
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={productsLoading}
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
                    <ProductTableToolbar
                      filters={filters}
                      onFilters={handleFilters}
                      stockOptions={PRODUCT_STOCK_OPTIONS}
                      publishOptions={PUBLISH_OPTIONS}
                    />

                    <GridToolbarQuickFilter />

                    <Stack
                      spacing={1}
                      flexGrow={1}
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      {!!selectedRowIds.length && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          onClick={confirmRows.onTrue}
                        >
                          Delete ({selectedRowIds.length})
                        </Button>
                      )}

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
        open={confirmRows.value || confirmDeleteId !== null}
        onClose={() => {
          confirmRows.onFalse();
          setConfirmDeleteId(null); // Clear the single delete ID
        }}
        title={confirmDeleteId !== null ? 'Confirm Deletion' : 'Delete'}
        content={
          confirmDeleteId !== null
            ? `Are you sure you want to delete this item?`
            : `Are you sure you want to delete ${selectedRowIds.length} items?`
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDeleteId !== null) {
                handleDeleteRowById(confirmDeleteId);
                setConfirmDeleteId(null); // Clear the single delete ID after deletion
              } else {
                handleDeleteRows();
                confirmRows.onFalse();
              }
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
