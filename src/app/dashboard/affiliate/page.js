"use client"
import { useEffect, useState } from 'react';
import { InvoiceListView } from 'src/sections/affiliate/view';
import { ine_managerequest_ModuleID } from 'src/utils/apiEndPoints';
import { getModulePermissions } from 'src/utils/commonFunction';
// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Manage Request List',
// };

// export default function InvoiceListPage() {
//   return <InvoiceListView />;
// }

export default function InvoiceListPage() {
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const moduleId = ine_managerequest_ModuleID; // Assuming you have a module ID
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
    <InvoiceListView permissions={permissions} />
  ) : (
    'Sorry, You do not have permission to access the features. Please try again later or contact the administrator.'
  );
}

