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

// import { useGetProducts } from 'src/api/product';
// import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import ProductTableToolbar from '../product-table-toolbar';
import ProductTableFiltersResult from '../manage_inventory-table-filters-result';
import {
  // RenderCellStock,
  // RenderCellPrice,
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
  RenderCellProductCode,
  RenderCellProductName,
  RenderCellProductBatch,
  RenderCellProductQty,
  RenderCellProductLocation,
} from '../manage_inventory-table-row';
import { INVENTORY_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';


// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 2, label: 'No' },
];

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['Business', 'actions'];

// ----------------------------------------------------------------------

export default function ProductListView() {
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  // const { products, productsLoading } = useGetProducts();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  // Listing data
  const getListingData = async () => {
    try {
      const response = await ManageAPIsData(INVENTORY_ENDPOINT, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText); s
        return;
      }
      const responseData = await response.json();
      if (responseData?.data?.length) {
        setTableData(responseData?.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getListingData();
  }, []);

  // useEffect(() => {
  //   if (products.length) {
  //     setTableData(products);
  //   }
  // }, [products]);

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

  // Single record delete
  const handleDeleteRow = useCallback(
    async (id) => {
      try {

        const apiUrl = `${INVENTORY_ENDPOINT}?id=${id}`;
        const response = await ManageAPIsData(apiUrl, 'DELETE');

        if (response.ok) {

          const updatedTableData = tableData.filter((row) => row.id !== id);
          enqueueSnackbar('Delete success!');
          setTableData(updatedTableData);
        } else {
          console.error("Error deleting data:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    },
    [enqueueSnackbar, tableData]
  );


  const handleDeleteRows = useCallback(async () => {
    const deletedIds = selectedRowIds.join(',');
    // const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
    try {

      const apiUrl = `${INVENTORY_ENDPOINT}?ids=${deletedIds}`;
      const response = await ManageAPIsData(apiUrl, 'DELETE');

      if (response.ok) {
        enqueueSnackbar('Delete success!');
        const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
        setTableData(deleteRows);
      } else {
        console.error("Error deleting data:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  // const handleEditRow = useCallback(
  //   (id) => {
  //     router.push(paths.dashboard.manage_inventory.edit(id));
  //   },
  //   [router]
  // );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_inventory.details(id));
    },
    [router]
  );

  const columns = [
    {
      field: 'name',
      headerName: 'Prefix',
      flex: 1,
      minWidth: "auto",
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'Prefix',
      headerName: 'Prefix',
      flex: 1,
      minWidth: "auto",
      hideable: false,
      renderCell: (params) => <RenderCellProductBatch params={params} />,
    },
    {
      field: 'Quantity',
      headerName: 'Quantity',
      flex: 1,
      minWidth: "auto",
      hideable: false,
      renderCell: (params) => <RenderCellProductQty params={params} />,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    // {
    //   field: 'inventoryType',
    //   headerName: 'Stock',
    //   width: 160,
    //   type: 'singleSelect',
    //   valueOptions: PRODUCT_STOCK_OPTIONS,
    //   renderCell: (params) => <RenderCellStock params={params} />,
    // },
    // {
    //   field: 'price',
    //   headerName: 'Price',
    //   width: 140,
    //   editable: true,
    //   renderCell: (params) => <RenderCellPrice params={params} />,
    // },
    // {
    //   field: 'pair',
    //   headerName: 'Pair',
    //   width: 110,
    //   type: 'singleSelect',
    //   editable: false,
    //   valueOptions: PUBLISH_OPTIONS,
    //   renderCell: (params) => <RenderCellPublish params={params} />,
    // },
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
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="solar:eye-bold" />}
        //   label="View"
        //   onClick={() => handleViewRow(params.row.id)}
        // />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="solar:trash-bin-trash-bold" />}
        //   label="Delete"
        //   onClick={() => {
        //     handleDeleteRow(params.row.id);
        //   }}
        //   sx={{ color: 'error.main' }}
        // />,
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
        {/*<CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Inventory',
              href: paths.dashboard.manage_inventory.root,
            },
            { name: 'List' },
          ]}
          // action={
          //   <Button
          //     component={RouterLink}
          //     href={paths.dashboard.manage_inventory.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="mingcute:add-line" />}
          //   >
          //     Add New
          //   </Button>
          // }
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />*/}

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
                    {/* <ProductTableToolbar
                      filters={filters}
                      onFilters={handleFilters}
                      stockOptions={PRODUCT_STOCK_OPTIONS}
                      publishOptions={PUBLISH_OPTIONS}
                    /> */}

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
  const { stock, publish, model_number, productName, location, quantity } = filters;

  let filteredData = inputData;

  // Filter by stock type
  if (stock.length) {
    filteredData = filteredData.filter((product) => stock.includes(product.inventoryType));
  }

  // Filter by publish status
  if (publish.length) {
    filteredData = filteredData.filter((product) => publish.includes(product.publish));
  }

  // Filter by model number
  if (model_number) {
    filteredData = filteredData.filter((product) =>
      product.model_number.toLowerCase().includes(model_number.toLowerCase())
    );
  }

  // Filter by product name
  if (productName) {
    filteredData = filteredData.filter((product) =>
      product['Product Name'].toLowerCase().includes(productName.toLowerCase())
    );
  }

  // Filter by location
  if (location) {
    filteredData = filteredData.filter((product) =>
      product.Location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Filter by quantity
  if (quantity) {
    filteredData = filteredData.filter((product) => product.Quantity === quantity);
  }

  return filteredData;
}
