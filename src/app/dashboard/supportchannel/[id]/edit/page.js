"use client"
import { InvoiceEditView } from 'src/sections/supportchannel/view';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getModulePermissions } from 'src/utils/commonFunction';
import { ine_category_ModuleID } from 'src/utils/apiEndPoints';

export default function InvoiceEditPage({ params }) {
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
    <InvoiceEditView id={id} />
  ) : (
    'Sorry, You do not have permission to access the features. Please try again later or contact the administrator.'
  );
}

InvoiceEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};