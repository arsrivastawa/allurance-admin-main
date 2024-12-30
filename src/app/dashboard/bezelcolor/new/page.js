"use client"
import React, { useEffect, useState } from 'react';
import { ProductCreateView } from 'src/sections/bezelcolor/view';
import { ine_bezel_color_ModuleID } from 'src/utils/apiEndPoints';
import { getModulePermissions } from 'src/utils/commonFunction';

export default function ProductListPage() {
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const moduleId = ine_bezel_color_ModuleID; // Assuming you have a module ID
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
