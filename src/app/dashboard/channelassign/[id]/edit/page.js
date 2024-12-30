// import PropTypes from 'prop-types';

// import axios, { endpoints } from 'src/utils/axios';

// import { ProductEditView } from 'src/sections/category/view';

// // ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Category Edit',
// };

// export default function ProductEditPage({ params }) {
//   const { id } = params;

//   return <ProductEditView id={id} />;
// }

// export async function generateStaticParams() {
//   const res = await axios.get(endpoints.product.list);

//   return res.data.products.map((product) => ({
//     id: product.id,
//   }));
// }

// ProductEditPage.propTypes = {
//   params: PropTypes.shape({
//     id: PropTypes.string,
//   }),
// };

"use client"
import PropTypes from 'prop-types';
import axios, { endpoints } from 'src/utils/axios';
import { useEffect, useState } from 'react';
import { ProductEditView } from 'src/sections/warehouse_channel_assign/view';
import { getModulePermissions } from 'src/utils/commonFunction';
import { MARKETING_ENDPOINT, ine_warehouse_ModuleID } from 'src/utils/apiEndPoints';
// export const metadata = {
//   title: 'Dashboard: Category Edit',
// };
export default function ProductEditPage({ params }) {
  const { id } = params;
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
