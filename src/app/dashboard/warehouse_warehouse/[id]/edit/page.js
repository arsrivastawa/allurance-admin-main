"use client"
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { ProductEditView } from 'src/sections/warehouse_warehouse/view';
import { getModulePermissions } from 'src/utils/commonFunction';
import { ine_category_ModuleID } from 'src/utils/apiEndPoints';

export default function ProductEditPage({ params }) {
  const { id } = params;
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const moduleId = ine_category_ModuleID; // Assuming you have a module ID
    const fetchPermissions = async () => {
      const modulePermissions = await getModulePermissions(moduleId);
      setPermissions(modulePermissions);
    };
    fetchPermissions();
  }, []);

  if (!permissions) {
    return <div>Loading...</div>;
  }

  const { update_access } = permissions;

  return update_access === 1 ? (
    <ProductEditView id={id} />
  ) : (
    'Sorry, You do not have permission to access the features. Please try again later or contact the administrator.'
  );
}

ProductEditPage.propTypes = {
  id: PropTypes.string.isRequired,
};


ProductEditPage.propTypes = {
  id: PropTypes.string.isRequired,
  hasPermission: PropTypes.bool.isRequired,
};
