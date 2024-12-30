import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useSettingsContext } from 'src/components/settings';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';
import { ManageAPIsDataWithHeader, fetchDataFromApi } from '../../utils/commonFunction';
import { MODULES_MODULE_CHECK_ENDPOINT, MODULES_MODULE_ENDPOINT, ROLE_PERMISSIONS_ENDPOINT } from '../../utils/apiEndPoints';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'src/routes/hooks'; // Import useRouter from next/router
import { jwtDecode } from 'src/auth/context/jwt/utils';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { Link } from '@mui/material';
import Logo from 'src/components/logo';
import Stack from '@mui/material/Stack';
import { NAV } from '../config-layout';

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');
  const nav = useBoolean();
  const isHorizontal = settings.themeLayout === 'horizontal';
  const isMini = settings.themeLayout === 'mini';
  const router = useRouter(); // Access the router object
  const renderNavMini = <NavMini />;
  const renderHorizontal = <NavHorizontal />;
  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;
  const [moduleOptions, setModuleOptions] = useState(null);
  const [moduleInnerOptions, setModuleInnerOptions] = useState({});
  const [expanded, setExpanded] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const handleChange = (parentId, panelId) => async (event, isExpanded) => {
    const newExpanded = { ...expanded };
    newExpanded[panelId] = isExpanded;
    if (parentId !== panelId) {
      Object.keys(newExpanded).forEach((key) => {
        if (key !== panelId && !key.startsWith(parentId)) {
          newExpanded[key] = false;
        }
        if (key.startsWith(parentId)) {
          newExpanded[key] = true;
        }
        else {
          newExpanded[key] = false;
        }
      });
    }
    else {
      Object.keys(newExpanded).forEach((key) => {
        if (key !== panelId && !key.startsWith(parentId)) {
          newExpanded[key] = false;
        }
      });
    }
    setExpanded(newExpanded);

    if (isExpanded) {
      // const apiUrl = MODULES_MODULE_ENDPOINT; //MODULES API
      const apiUrl = MODULES_MODULE_CHECK_ENDPOINT; //PARTICULAR API 
      try {
        let RoleID;
        const STORAGE_KEY = 'accessToken';
        let accessToken;
        if (typeof sessionStorage !== 'undefined') {
          accessToken = sessionStorage.getItem(STORAGE_KEY);
        } else {
          console.error("sessionStorage is not available in this environment.");
        }
        let decoded;
        if (accessToken != null && accessToken !== undefined) {
          decoded = jwtDecode(accessToken);
          RoleID = decoded.data.role_id;
        } else {
          console.error("accessToken is undefined. Cannot decode.");
        }
        const body = { role_id: RoleID }; // Construct the body object
        const responseData = await fetchDataFromApi(`${apiUrl}?id=${panelId}`, 'POST', body);
        if (responseData) {
          setModuleInnerOptions((prevOptions) => ({
            ...prevOptions,
            [panelId]: responseData,
          }));
        } else {
          setModuleInnerOptions((prevOptions) => ({
            ...prevOptions,
            [panelId]: [],
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };


  const getListingData = async () => {
    try {
      let body = {};
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      let userId;
      const STORAGE_KEY = 'accessToken';
      let accessToken;
      if (typeof sessionStorage !== 'undefined') {
        accessToken = sessionStorage.getItem(STORAGE_KEY);
      } else {
        console.error("sessionStorage is not available in this environment.");
      }
      let decoded;
      if (accessToken != null && accessToken !== undefined) {
        decoded = jwtDecode(accessToken);
        userId = decoded.data.id;
      } else {
        console.error("accessToken is undefined. Cannot decode.");
      }
      body.userId = await userId
      body.indexOf = 0
      body.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(ROLE_PERMISSIONS_ENDPOINT, 'POST', body);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      setModuleOptions(responseData.data);
      const initialState = {};
      responseData.data.forEach(module => {
        initialState[module.module_id] = false;
      });
      setExpanded(initialState);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const modulesData = async () => {
    const apiUrl = MODULES_MODULE_ENDPOINT;
    try {
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setModuleOptions(responseData);
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
    }
  };

  useEffect(() => {
    getListingData();
    // modulesData();
  }, []);

  return (
    <>
      <Header onOpenNav={nav.onTrue} />
      
      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          width: "auto",
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          <Logo />
          <div className='customAccordionDiv'>
          {moduleOptions && moduleOptions.filter(option => option.read_access === 1).map(option => (
            option.path ? (<>
              <div style={{ display: 'flex', alignItems: 'center', padding: 15 }} >
                <SvgColor src={`/assets/icons/navbar/${option.icon}.svg`} sx={{ width: 24, height: 24, marginRight: 1 }} />
                <Typography key={option.module_id} to={option.path} style={{ cursor: 'pointer', textDecoration: 'none' }} onClick={() => option.path && router.push(option.path)}>
                  {option.name}
                </Typography>
              </div>
            </>
            ) : (
              <Accordion
                key={option.module_id}
                expanded={expanded[option.module_id]}
                onChange={handleChange(option.module_id, option.module_id)}

              >
                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                  <SvgColor src={`/assets/icons/navbar/${option.icon}.svg`} sx={{ width: 24, height: 24, marginRight: 2 }} />
                  <Typography className='Head1' key={option.module_id} style={{ cursor: 'pointer', textDecoration: 'none' }} onClick={() => option.path && router.push(option.path)}>
                    {option.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className='Head2'>
                  {moduleInnerOptions[option.module_id] && moduleInnerOptions[option.module_id].map(innerOption => (
                    <React.Fragment key={innerOption.module_id}>
                      {innerOption.path ? (
                        <>
                          {(innerOption.add_access === 1 && innerOption.name === "Create") || (innerOption.read_access === 1 && innerOption.name === "List") || ((innerOption.name != "Create" && innerOption.name != "List") && innerOption.read_access === 1) ?
                            <div>
                              <Typography className="Head21" key={innerOption.module_id} style={{ cursor: 'pointer', textDecoration: 'none' }} onClick={() => innerOption.path && router.push(innerOption.path)}>
                                <Iconify icon="mingcute:right-line" /> {innerOption.name}
                              </Typography>

                            </div>
                            : ""}
                        </>
                      ) : (
                        (!innerOption.path && innerOption.read_access === 1 ? (
                          <Accordion
                            expanded={expanded[innerOption.id]}
                            onChange={handleChange(option.module_id, innerOption.id)}
                          >
                            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                              <Typography>{innerOption.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {moduleInnerOptions[innerOption.id] && moduleInnerOptions[innerOption.id].map(innerData => (
                                (moduleInnerOptions.add_access === 1 && moduleInnerOptions.name === "Create") || (moduleInnerOptions.read_access === 1 && moduleInnerOptions.name === "List") || (moduleInnerOptions.name != "Create" && moduleInnerOptions.name != "List") ?
                                  <> <Typography className="Head22" style={{ cursor: 'pointer', textDecoration: 'none' }} key={innerData.id} onClick={() => innerData.path && router.push(innerData.path)}>
                                    <Iconify icon="mingcute:right-line" /> {innerData.name}
                                  </Typography>

                                  </> : ""
                              ))}
                            </AccordionDetails>
                          </Accordion>
                        ) : ""))}
                    </React.Fragment>
                  ))}
                </AccordionDetails>

              </Accordion>
            )
          ))}
        </div>
        </Stack>
        <Main style={{marginLeft:'17%'}}>{children}</Main>
      </Box >
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
