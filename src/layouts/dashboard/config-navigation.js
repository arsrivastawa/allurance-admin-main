// // NEWER CODE

// import { useContext, useEffect, useMemo, useState } from 'react';
// import { useTranslate } from "src/locales";
// import { PermissionContext } from 'src/components/Permissions/context/permissions-provider';

// import Label from 'src/components/label';
// import Iconify from 'src/components/iconify';
// import SvgColor from 'src/components/svg-color';
// import { paths } from 'src/routes/paths';
// import { ROLE_PERMISSIONS_ENDPOINT } from 'src/utils/apiEndPoints';
// import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';

// const icon = (name) => (                                      
//   <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
// );

// const ICONS = {
//   job: icon('ic_job'),
//   blog: icon('ic_blog'),
//   chat: icon('ic_chat'),
//   mail: icon('ic_mail'),
//   user: icon('ic_user'),
//   file: icon('ic_file'),
//   lock: icon('ic_lock'),
//   tour: icon('ic_tour'),
//   order: icon('ic_order'),
//   label: icon('ic_label'),
//   blank: icon('ic_blank'),
//   kanban: icon('ic_kanban'),
//   folder: icon('ic_folder'),
//   banking: icon('ic_banking'),
//   booking: icon('ic_booking'),
//   invoice: icon('ic_invoice'),
//   product: icon('ic_product'),
//   calendar: icon('ic_calendar'),
//   disabled: icon('ic_disabled'),
//   external: icon('ic_external'),
//   menuItem: icon('ic_menu_item'),
//   ecommerce: icon('ic_ecommerce'),
//   analytics: icon('ic_analytics'),
//   dashboard: icon('ic_dashboard'),
//   setting: icon('ic_settings'),
//   gift: icon('ic_gift'),
//   group: icon('ic_groups'),
//   design: icon('ic_designs'),
// };

// export function useNavData() {
//   const { t } = useTranslate();
//   const [listingData, setListingData] = useState([]);

//   const getListingData = async () => {
//     try {
//       const token = await sessionStorage.getItem('accessToken');
//       if (!token) {
//         console.error("Token is undefined.");
//         return;
//       }
//       const response = await ManageAPIsDataWithHeader(ROLE_PERMISSIONS_ENDPOINT, 'POST', { headers: { Authorization: `Bearer ${token}` } });
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const responseData = await response.json();

//       setListingData(responseData.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     getListingData();
//   }, []);
//   const sidebarItems = useMemo(() => {
//     return listingData.map(item => ({
//       subheader: t(item.name),
//       icon: <SvgColor src={`/assets/icons/navbar/${item.icon}.svg`} sx={{ width: 1, height: 1 }} />, // Use icon if defined in ICONS, otherwise null
//       items: item.children ? item.children.map(child => ({
//         title: t(child.name),
//         path: child.path || '/#', // Set path to '#' if not defined
//         icon: <SvgColor src={`/assets/icons/navbar/${item.icon}.svg`} sx={{ width: 1, height: 1 }} />, // Use icon if defined in ICONS, otherwise null
//         // Render dropdown if child has children
//         dropdown: child.children && child.children.length > 0 ? child.children.map(subChild => ({
//           title: t(subChild.name),
//           path: subChild.path || '/#', // Set path to '#' if not defined
//           icon: "", // Use icon if defined in ICONS, otherwise null
//         })) : null,
//         hasChildren: child.children && child.children.length > 0, // Indicates if the item has children
//       })) : [],
//       hasChildren: item.children && item.children.some(child => child.children && child.children.length > 0), // Indicates if the parent has children
//     }));
//   }, [listingData, t]);
//   return sidebarItems;
// }



// OLDER CODE

import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslate } from "src/locales";
import { PermissionContext } from 'src/components/Permissions/context/permissions-provider';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { paths } from 'src/routes/paths';
import { ROLE_PERMISSIONS_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';



// // ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  setting: icon('ic_settings'),
  gift: icon('ic_gift'),
  group: icon('ic_groups'),
  design: icon('ic_designs'),
  inventory: icon('ic_inventory'),
  batch: icon('ic_batch'),
  replicate: icon('ic_replication'),
  sale: icon('ic_sale')
};

// // ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();

  const { permissions } = useContext(PermissionContext);


  // FUNCTION TO CHECK READ ACCESS
  const hasReadAccess = async moduleId => {
    const permission = await permissions?.find(item => item.module_id === moduleId);

    return permission && permission?.read_access;
  };

  // FUNCTION TO CHECK ADD ACCESS
  const hasAddAccess = async moduleId => {
    try {
      const permission = await permissions?.find(item => item?.module_id === moduleId);
      return permission && permission?.add_access;
    } catch (error) {
      console.error("error")
    }
  };

  const data = useMemo(
    () => [
      {
        subheader: t('overview'),
        items: [
          {
            id: 1,
            title: t('ecommerce'),
            path: paths.dashboard.general.ecommerce,
            icon: ICONS.ecommerce,
          },
        ],
      },
      {
        subheader: t('management'),
        items: [
          {
            title: t('raw_masters'),
            path: [paths.dashboard.category.root, paths.dashboard.resintype.root, paths.dashboard.shape.root, paths.dashboard.sizeforshape.root, paths.dashboard.bezelmaterial.root, paths.dashboard.bezelcolor.root, paths.dashboard.innermaterial.root, paths.dashboard.flower.root, paths.dashboard.colorshade.root],
            icon: ICONS.menuItem,
            children: [
              hasReadAccess(3) ? {
                id: 3,
                title: t('category'),
                path: paths.dashboard.category.root,
                children: hasAddAccess(3) ? [
                  { title: t('list'), path: paths.dashboard.category.root },
                  { title: t('create'), path: paths.dashboard.category.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.category.root },
                ]
              } : null,
              hasReadAccess(4) ? {
                id: 4,
                title: t('resintype'),
                path: paths.dashboard.resintype.root,
                children: hasAddAccess(4) ? [
                  { title: t('list'), path: paths.dashboard.resintype.root },
                  { title: t('create'), path: paths.dashboard.resintype.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.resintype.root },
                ]
              } : null,
              hasReadAccess(5) ? {
                id: 5,
                title: t('shape'),
                path: paths.dashboard.shape.root,
                children: hasAddAccess(5) ? [
                  { title: t('list'), path: paths.dashboard.shape.root },
                  { title: t('create'), path: paths.dashboard.shape.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.shape.root },
                ]
              } : "",
              hasReadAccess(6) ? {
                id: 6,
                title: t('sizeforshape'),
                path: paths.dashboard.sizeforshape.root,
                children: hasAddAccess(6) ? [
                  { title: t('list'), path: paths.dashboard.sizeforshape.root },
                  { title: t('create'), path: paths.dashboard.sizeforshape.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.sizeforshape.root },
                ]
              } : null,
              hasReadAccess(7) ? {
                id: 7,
                title: t('bezelmaterial'),
                path: paths.dashboard.bezelmaterial.root,
                children: hasAddAccess(7) ? [
                  { title: t('list'), path: paths.dashboard.bezelmaterial.root },
                  { title: t('create'), path: paths.dashboard.bezelmaterial.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.bezelmaterial.root },
                ]
              } : null,
              hasReadAccess(8) ? {
                id: 8,
                title: t('bezelcolor'),
                path: paths.dashboard.bezelcolor.root,
                children: hasAddAccess(8) ? [
                  { title: t('list'), path: paths.dashboard.bezelcolor.root },
                  { title: t('create'), path: paths.dashboard.bezelcolor.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.bezelcolor.root },
                ]
              } : null,
              hasReadAccess(9) ? {
                id: 9,
                title: t('innermaterial'),
                path: paths.dashboard.innermaterial.root,
                children: hasAddAccess(9) ? [
                  { title: t('list'), path: paths.dashboard.innermaterial.root },
                  { title: t('create'), path: paths.dashboard.innermaterial.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.innermaterial.root },
                ]
              } : null,
              hasReadAccess(10) ? {
                id: 10,
                title: t('flower'),
                path: paths.dashboard.flower.root,
                children: hasAddAccess(10) ? [
                  { title: t('list'), path: paths.dashboard.flower.root },
                  { title: t('create'), path: paths.dashboard.flower.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.flower.root },
                ]
              } : null,
              hasReadAccess(11) ? {
                id: 11,
                title: t('colorshade'),
                path: paths.dashboard.colorshade.root,
                children: hasAddAccess(11) ? [
                  { title: t('list'), path: paths.dashboard.colorshade.root },
                  { title: t('create'), path: paths.dashboard.colorshade.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.colorshade.root },
                ]
              } : null,
            ],
          },
          {
            title: t('usermanagement'),
            path: [paths.dashboard.users.root, paths.dashboard.role.root],
            icon: ICONS.user,
            children: [
              hasReadAccess(12) ? {
                id: 12,
                title: t('role'),
                path: paths.dashboard.role.root,
                children: hasAddAccess(12) ? [
                  { title: t('list'), path: paths.dashboard.role.root },
                  { title: t('create'), path: paths.dashboard.role.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.role.root },
                ]
              } : null,
              hasReadAccess(13) ? {
                id: 13,
                title: t('users'),
                path: paths.dashboard.users.root,
                children: hasAddAccess(13) ? [
                  { title: t('list'), path: paths.dashboard.users.root },
                  { title: t('create'), path: paths.dashboard.users.new },
                ] : [
                  { title: t('list'), path: paths.dashboard.users.root },
                ]
              } : null,
              { title: t('managepermission'), path: paths.dashboard.role.managepermission },
            ],
          },
          { title: t('managerequest'), icon: ICONS.file, path: paths.dashboard.manage_request.root },
          {
            title: t('manage_design'),
            path: paths.dashboard.manage_design.root,
            icon: ICONS.design,
            children: [
              { title: t('list'), path: paths.dashboard.manage_design.root },
              { title: t('create'), path: paths.dashboard.manage_design.new },
            ],
          },
          hasReadAccess(14) ? {
            id: 14,
            title: t('customer'),
            path: paths.dashboard.customer.root,
            icon: ICONS.group,
            children: hasAddAccess(14) ? [
              { title: t('list'), path: paths.dashboard.customer.root },
              { title: t('create'), path: paths.dashboard.customer.new },
            ] : [
              { title: t('list'), path: paths.dashboard.customer.root },
            ]
          } : null,

          {
            title: t('settings'),
            path: paths.dashboard.settings.root,
            icon: ICONS.setting,
            children: [
              { title: t('myprofile'), path: paths.dashboard.settings.myprofile },
              { title: t('changepassword'), path: paths.dashboard.settings.changepassword },
              // { title: t('activitylog'), path: paths.dashboard.settings.activitylog },
            ],
          },
          hasReadAccess(17) ? {
            id: 17,
            title: t('Gift cards'),
            path: [paths.dashboard.gift_card.root, paths.dashboard.people_gift_card.root, paths.dashboard.single_gift_card.root],
            icon: ICONS.gift,
            children: [
              {
                title: t('Multiple for Business'),
                path: paths.dashboard.gift_card.root,
                children: [
                  { title: t('list'), path: paths.dashboard.gift_card.root },
                  { title: t('create'), path: paths.dashboard.gift_card.new },
                ],
              },
              {
                title: t(' Multiple for People'),
                path: paths.dashboard.people_gift_card.root,
                children: [
                  { title: t('list'), path: paths.dashboard.people_gift_card.root },
                  { title: t('create'), path: paths.dashboard.people_gift_card.new },
                ],
              },
              {
                title: t('Single'),
                path: paths.dashboard.single_gift_card.root,
                children: [
                  { title: t('list'), path: paths.dashboard.single_gift_card.root },
                  { title: t('create'), path: paths.dashboard.single_gift_card.new },
                ],
              },
            ]
          } : null,
          hasReadAccess(18) ? {
            id: 18,
            title: t('Manage Sales'),
            path: [paths.dashboard.manage_sales.root, paths.dashboard.manage_sales.root, paths.dashboard.manage_sales.root],
            icon: ICONS.analytics,
            children: hasAddAccess(18) ? [
              { title: t('list'), path: paths.dashboard.manage_sales.root },
              // { title: t('create'), path: paths.dashboard.manage_sales.new },
            ] : [
              { title: t('list'), path: paths.dashboard.manage_sales.root },
            ]
          } : null,
          hasReadAccess(19) ? {
            id: 19,
            title: t('Inventory Lookup'),
            path: [paths.dashboard.inventory_lookup.root, paths.dashboard.inventory_lookup.root, paths.dashboard.inventory_lookup.root],
            icon: ICONS.inventory,
            children: hasAddAccess(19) ? [
              { title: t('list'), path: paths.dashboard.inventory_lookup.root },
              // { title: t('create'), path: paths.dashboard.manage_inventory.new },
            ] : [
              { title: t('list'), path: paths.dashboard.inventory_lookup.root },
            ]
          } : null,
          hasReadAccess(20) ? {
            id: 20,
            title: t('Manage Batches'),
            path: [paths.dashboard.manage_batches.root, paths.dashboard.manage_batches.root, paths.dashboard.manage_batches.root],
            icon: ICONS.batch,
            children: hasAddAccess(20) ? [
              { title: t('list'), path: paths.dashboard.manage_batches.root },
              // { title: t('create'), path: paths.dashboard.manage_batches.new },
            ] : [
              { title: t('list'), path: paths.dashboard.manage_batches.root },
            ]
          } : null
        ],
      },
      {
        subheader: t('Seller Dashboard'),
        items: [
          hasReadAccess(21) ? {
            id: 21,
            title: t('Sell'),
            path: [paths.dashboard.branch_sell.root, paths.dashboard.branch_sell.new, paths.dashboard.branch_sell.root],
            icon: ICONS.sale,
            children: hasAddAccess(21) ? [
              // { title: t('list'), path: paths.dashboard.branch_sell.root },
              { title: t('create'), path: paths.dashboard.branch_sell.new },
            ] : [
              { title: t('list'), path: paths.dashboard.branch_sell.root },
            ]
          } : null,
        ],
      },
      {
        subheader: t('Replicator Dashboard'),
        items: [
          hasReadAccess(22) ? {
            id: 21,
            title: t('Replicate'),
            path: [paths.dashboard.replicate.root, paths.dashboard.findreplicationmodel.root, paths.dashboard.findreplicationmodel.new],
            icon: ICONS.replicate,
            children: [
              { title: t('Find model'), path: paths.dashboard.findreplicationmodel.root },
              { title: t('My replicator'), path: paths.dashboard.replicate.root },
              // { title: t('create'), path: paths.dashboard.replicate.new },
            ]
          } : null
        ],
      },
      {
        subheader: t('User Logs'),
        items: [
          hasReadAccess(22) ? {
            id: 21,
            title: t('Logs'),
            path: [paths.dashboard.log.root, paths.dashboard.log.root, paths.dashboard.log.new],
            icon: ICONS.kanban,
            children: [
              { title: t('list'), path: paths.dashboard.log.root },
            ]
          } : null,
        ],
      },
    ],
    [t]
  );

  return data;
}

