// import { ProductCreateView } from 'src/sections/category/view';

// // ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Add New Category',
// };

// export default function ProductCreatePage() {
//   return <ProductCreateView />;
// }

// "use client"
// import { ProductCreateView } from 'src/sections/category/view';
// import { usePermissions } from 'src/utils/PermissionFunction';
// // ----------------------------------------------------------------------

// const metadata = {
//   title: 'Dashboard: Add New Category',
// };

// export default function ProductCreatePage() {
//   return <ProductCreateView />;
// }


"use client"
import React, { useEffect, useState } from 'react';
import { ProductCreateView } from 'src/sections/warehouse_channel_assign/view';
import { ine_warehouse_ModuleID } from 'src/utils/apiEndPoints';
import { getModulePermissions } from 'src/utils/commonFunction';
// import { metadata } from "./metadata"

// export const metadata = {
//   title: 'Dashboard: Category List',
// };


export default function ProductListPage() {
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const moduleId = ine_warehouse_ModuleID; // Assuming you have a module ID
    const fetchPermissions = async () => {
      const modulePermissions = await getModulePermissions(moduleId);
      setPermissions(modulePermissions);
    };
    fetchPermissions();
  }, []);

  if (!permissions) {
    return <div>Loading...</div>;
  }

  const { add_access } = permissions;

  return add_access === 1 ? (
    <ProductCreateView permissions={permissions} />
  ) : (
    'Sorry, You do not have permission to access the features. Please try again later or contact the administrator.'
  );
}