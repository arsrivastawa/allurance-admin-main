'use client';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';
import { useSettingsContext } from 'src/components/settings';
import AppNewInvoice from '../app-new-invoice';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import { useEffect, useState } from 'react';
import { ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import {
  ADMIN_DASHBOARD_ALL_USERS,
  ADMIN_DASHBOARD_BLOGS,
  ADMIN_DASHBOARD_CAMPAIGN,
  ADMIN_DASHBOARD_CONTACT_INQUIRY,
  ADMIN_DASHBOARD_GIFT_CARD,
  ADMIN_DASHBOARD_ORDER,
  ADMIN_DASHBOARD_RATING,
  ADMIN_DASHBOARD_ROLES,
} from 'src/utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const [tableData, setTableData] = useState([]);
  const [roleData, setRolesData] = useState([]);
  const [orderData, setOrdersData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const [inquiryData, setInquiryData] = useState([]);
  const [giftCardData, setGiftCardData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [campaignData, setCampaignData] = useState([]);

  const getData = async (url, setter) => {
    try {
      const response = await ManageAPIsDataWithHeader(url, 'POST');
      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        setter(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getData(ADMIN_DASHBOARD_ALL_USERS, setTableData);
    getData(ADMIN_DASHBOARD_ROLES, setRolesData);
    getData(ADMIN_DASHBOARD_ORDER, setOrdersData);
    getData(ADMIN_DASHBOARD_BLOGS, setBlogsData);
    getData(ADMIN_DASHBOARD_CONTACT_INQUIRY, setInquiryData);
    getData(ADMIN_DASHBOARD_GIFT_CARD, setGiftCardData);
    getData(ADMIN_DASHBOARD_RATING, setRatingData);
    getData(ADMIN_DASHBOARD_CAMPAIGN, setCampaignData);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Users"
            total={tableData?.length}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Roles"
            total={roleData?.length}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Orders"
            total={orderData?.length}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Blogs"
            total={blogsData?.length}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Inquiry"
            total={inquiryData?.length}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Gift Card"
            total={giftCardData?.length}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Ratings"
            total={ratingData?.length}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Campaign"
            total={campaignData?.length}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Current Download"
            chart={{
              series: [
                { label: 'Mac', value: 12244 },
                { label: 'Window', value: 53345 },
                { label: 'iOS', value: 44313 },
                { label: 'Android', value: 78343 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Area Installed"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  year: '2019',
                  data: [
                    {
                      name: 'Asia',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'America',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Asia',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'America',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} lg={12}>
          <AppNewInvoice
            title="New Invoice"
            tableData={_appInvoices}
            tableLabels={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Category' },
              { id: 'price', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid> */}
      </Grid>
    </Container>
  );
}
