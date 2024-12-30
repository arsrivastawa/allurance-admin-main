"use client"
import { useEffect, useState } from 'react';
import { ine_batches_ModuleID } from 'src/utils/apiEndPoints';
import { ProductListView } from 'src/sections/batches/view';
import { getModulePermissions } from 'src/utils/commonFunction';
// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Batches List',
// };

// export default function ProductListPage() {
//   return <ProductListView />;
// }

export default function ProductListPage() {
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const moduleId = ine_batches_ModuleID; // Assuming you have a module ID
    const fetchPermissions = async () => {
      const modulePermissions = await getModulePermissions(moduleId);
      setPermissions(modulePermissions);
    };
    fetchPermissions();
  }, []);

  if (!permissions) {
    return <div>Loading...</div>;
  }

  const { read_access } = permissions;

  return read_access === 1 ? (
    <ProductListView permissions={permissions} />
  ) : (
    'Sorry, You do not have permission to access the features. Please try again later or contact the administrator.'
  );
}