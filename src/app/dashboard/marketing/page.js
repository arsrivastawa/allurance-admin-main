"use client"
import React, { useEffect, useState } from 'react';
import { ProductListView } from 'src/sections/marketingf/view';
import { ine_marekting_ModuleID } from 'src/utils/apiEndPoints';
import { getModulePermissions } from 'src/utils/commonFunction';

export default function ProductListPage() {
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const moduleId = ine_marekting_ModuleID; // Assuming you have a module ID
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