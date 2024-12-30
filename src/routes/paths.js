import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';
import { Donegal_One } from 'next/font/google';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/hjxMnGUJCjY7pX8lQbS7kn/%5BPreview%5D-Minimal-Web.v5.4.0?type=design&node-id=0-1&mode=design&t=2fxnS70DuiTLGzND-0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: {
      details: `/product/${MOCK_ID}`,
    },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: {
      details: `/post/${paramCase(MOCK_TITLE)}`,
    },
  },
  // AUTH
  auth: {
    amplify: {
      login: `${ROOTS.AUTH}/amplify/login`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      register: `${ROOTS.AUTH}/amplify/register`,
      newPassword: `${ROOTS.AUTH}/amplify/new-password`,
      forgotPassword: `${ROOTS.AUTH}/amplify/forgot-password`,
    },
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      register: `${ROOTS.AUTH}/firebase/register`,
      forgotPassword: `${ROOTS.AUTH}/firebase/forgot-password`,
    },
    auth0: {
      login: `${ROOTS.AUTH}/auth0/login`,
    },
    supabase: {
      login: `${ROOTS.AUTH}/supabase/login`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      register: `${ROOTS.AUTH}/supabase/register`,
      newPassword: `${ROOTS.AUTH}/supabase/new-password`,
      forgotPassword: `${ROOTS.AUTH}/supabase/forgot-password`,
    },
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    // manage_request: `${ROOTS.DASHBOARD}/manage_request`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    // DONE
    category: {
      root: `${ROOTS.DASHBOARD}/category`,
      new: `${ROOTS.DASHBOARD}/category/new`,
      details: (id) => `${ROOTS.DASHBOARD}/category/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/category/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/category/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/category/${MOCK_ID}/edit`,
      },
    },

    social: {
      root: `${ROOTS.DASHBOARD}/social`,
      new: `${ROOTS.DASHBOARD}/social/new`,
      details: (id) => `${ROOTS.DASHBOARD}/social/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/social/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/social/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/social/${MOCK_ID}/edit`,
      },
    },

    qualitycheck: {
      root: `${ROOTS.DASHBOARD}/qualitycheck`,
      new: `${ROOTS.DASHBOARD}/qualitycheck/new`,
      details: (id) => `${ROOTS.DASHBOARD}/qualitycheck/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/qualitycheck/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/qualitycheck/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/qualitycheck/${MOCK_ID}/edit`,
      },
    },

    packing: {
      root: `${ROOTS.DASHBOARD}/packing`,
      new: `${ROOTS.DASHBOARD}/packing/new`,
      details: (id) => `${ROOTS.DASHBOARD}/packing/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/packing/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/packing/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/packing/${MOCK_ID}/edit`,
      },
    },

    manage_offline_sales: {
      root: `${ROOTS.DASHBOARD}/manage_offline_sales`,
      step1: `${ROOTS.DASHBOARD}/manage_offline_sales/step1`,
      step2: `${ROOTS.DASHBOARD}/manage_offline_sales/step2`,
      step3: `${ROOTS.DASHBOARD}/manage_offline_sales/step3`,
      step4: `${ROOTS.DASHBOARD}/manage_offline_sales/step4`,
      step5: `${ROOTS.DASHBOARD}/manage_offline_sales/step5`,
      step6: `${ROOTS.DASHBOARD}/manage_offline_sales/step6`,
      step7: `${ROOTS.DASHBOARD}/manage_offline_sales/step7`,
      step8: `${ROOTS.DASHBOARD}/manage_offline_sales/step8`,

      details: (id) => `${ROOTS.DASHBOARD}/manage_offline_sales/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_offline_sales/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_offline_sales/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_offline_sales/${MOCK_ID}/edit`,
      },
    },

    manage_batches: {
      root: `${ROOTS.DASHBOARD}/manage_batches`,
      new: `${ROOTS.DASHBOARD}/manage_batches/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_batches/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_batches/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_batches/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_batches/${MOCK_ID}/edit`,
      },
    },

    inventory_lookup: {
      root: `${ROOTS.DASHBOARD}/inventory_lookup`,
      new: `${ROOTS.DASHBOARD}/inventory_lookup/new`,
      details: (id) => `${ROOTS.DASHBOARD}/inventory_lookup/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/inventory_lookup/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/inventory_lookup/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/inventory_lookup/${MOCK_ID}/edit`,
      },
    },

    warehouse_warehouse: {
      root: `${ROOTS.DASHBOARD}/warehouse_warehouse`,
      new: `${ROOTS.DASHBOARD}/warehouse_warehouse/new`,
      details: (id) => `${ROOTS.DASHBOARD}/warehouse_warehouse/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/warehouse_warehouse/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/warehouse_warehouse/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/warehouse_warehouse/${MOCK_ID}/edit`,
      },
    },

    warehouse_racks: {
      root: `${ROOTS.DASHBOARD}/warehouse_racks`,
      new: `${ROOTS.DASHBOARD}/warehouse_racks/new`,
      details: (id) => `${ROOTS.DASHBOARD}/warehouse_racks/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/warehouse_racks/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/warehouse_racks/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/warehouse_racks/${MOCK_ID}/edit`,
      },
    },

    warehouse_boxes: {
      root: `${ROOTS.DASHBOARD}/warehouse_boxes`,
      new: `${ROOTS.DASHBOARD}/warehouse_boxes/new`,
      details: (id) => `${ROOTS.DASHBOARD}/warehouse_boxes/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/warehouse_boxes/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/warehouse_boxes/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/warehouse_boxes/${MOCK_ID}/edit`,
      },
    },

    manage_ticket_subject: {
      root: `${ROOTS.DASHBOARD}/manage_ticket_subject`,
      new: `${ROOTS.DASHBOARD}/manage_ticket_subject/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_ticket_subject/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_ticket_subject/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_ticket_subject/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_ticket_subject/${MOCK_ID}/edit`,
      },
    },

    manage_ticket: {
      root: `${ROOTS.DASHBOARD}/manage_ticket`,
      new: `${ROOTS.DASHBOARD}/manage_ticket/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_ticket/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_ticket/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_ticket/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_ticket/${MOCK_ID}/edit`,
      },
    },

    reports: {
      root: `${ROOTS.DASHBOARD}/reports`,
      details: (id) => `${ROOTS.DASHBOARD}/reports/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/reports/${MOCK_ID}`,
      },
    },

    // DONE
    resintype: {
      root: `${ROOTS.DASHBOARD}/resintype`,
      new: `${ROOTS.DASHBOARD}/resintype/new`,
      details: (id) => `${ROOTS.DASHBOARD}/resintype/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/resintype/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/resintype/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/resintype/${MOCK_ID}/edit`,
      },
    },
    // DONE
    shape: {
      root: `${ROOTS.DASHBOARD}/shape`,
      new: `${ROOTS.DASHBOARD}/shape/new`,
      details: (id) => `${ROOTS.DASHBOARD}/shape/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/shape/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/shape/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/shape/${MOCK_ID}/edit`,
      },
    },
    // DONE
    sizeforshape: {
      root: `${ROOTS.DASHBOARD}/sizeforshape`,
      new: `${ROOTS.DASHBOARD}/sizeforshape/new`,
      details: (id) => `${ROOTS.DASHBOARD}/sizeforshape/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/sizeforshape/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/sizeforshape/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/sizeforshape/${MOCK_ID}/edit`,
      },
    },
    designer_dashboard: {
      root: `${ROOTS.DASHBOARD}/designer_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },

    replicator_dashboard: {
      root: `${ROOTS.DASHBOARD}/replicator_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },

    packer_dashboard: {
      root: `${ROOTS.DASHBOARD}/packer_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },

    warehouse_dashboard: {
      root: `${ROOTS.DASHBOARD}/warehouse_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },

    support_dashboard: {
      root: `${ROOTS.DASHBOARD}/support_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },

    offline_sales_dashboard: {
      root: `${ROOTS.DASHBOARD}/offline_sales_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },
    
    affiliation_dashboard: {
      root: `${ROOTS.DASHBOARD}/affiliation_dashboard`,
      // new: `${ROOTS.DASHBOARD}/designer_dashboard/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}`,
      // edit: (id) => `${ROOTS.DASHBOARD}/designer_dashboard/${id}/edit`,
      // demo: {
      //   details: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}`,
      //   edit: `${ROOTS.DASHBOARD}/designer_dashboard/${MOCK_ID}/edit`,
      // },
    },


    // DONE
    bezelmaterial: {
      root: `${ROOTS.DASHBOARD}/bezelmaterial`,
      new: `${ROOTS.DASHBOARD}/bezelmaterial/new`,
      details: (id) => `${ROOTS.DASHBOARD}/bezelmaterial/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/bezelmaterial/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/bezelmaterial/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/bezelmaterial/${MOCK_ID}/edit`,
      },
    },
    // DONE
    bezelcolor: {
      root: `${ROOTS.DASHBOARD}/bezelcolor`,
      new: `${ROOTS.DASHBOARD}/bezelcolor/new`,
      details: (id) => `${ROOTS.DASHBOARD}/bezelcolor/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/bezelcolor/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/bezelcolor/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/bezelcolor/${MOCK_ID}/edit`,
      },
    },
    // DONE
    innermaterial: {
      root: `${ROOTS.DASHBOARD}/innermaterial`,
      new: `${ROOTS.DASHBOARD}/innermaterial/new`,
      details: (id) => `${ROOTS.DASHBOARD}/innermaterial/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/innermaterial/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/innermaterial/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/innermaterial/${MOCK_ID}/edit`,
      },
    },
    // DONE
    flower: {
      root: `${ROOTS.DASHBOARD}/flower`,
      new: `${ROOTS.DASHBOARD}/flower/new`,
      details: (id) => `${ROOTS.DASHBOARD}/flower/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/flower/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/flower/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/flower/${MOCK_ID}/edit`,
      },
    },
    // DONE
    colorshade: {
      root: `${ROOTS.DASHBOARD}/colorshade`,
      new: `${ROOTS.DASHBOARD}/colorshade/new`,
      details: (id) => `${ROOTS.DASHBOARD}/colorshade/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/colorshade/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/colorshade/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/colorshade/${MOCK_ID}/edit`,
      },
    },

    // DONE
    role: {
      root: `${ROOTS.DASHBOARD}/role`,
      new: `${ROOTS.DASHBOARD}/role/new`,
      managepermission: `${ROOTS.DASHBOARD}/role/managepermission`,
      details: (id) => `${ROOTS.DASHBOARD}/role/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/role/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/role/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/role/${MOCK_ID}/edit`,
      },
    },
    // DONE
    manage_request: {
      root: `${ROOTS.DASHBOARD}/manage_request`,
      manage_request: `${ROOTS.DASHBOARD}/manage_request/manage_request`,

      new: `${ROOTS.DASHBOARD}/manage_request/new`,
      // manage_request: `${ROOTS.DASHBOARD}/manage_request/manage_request`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_request/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_request/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_request/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_request/${MOCK_ID}/edit`,
      },
    },

    affiliate: {
      root: `${ROOTS.DASHBOARD}/affiliate`,
      affiliate: `${ROOTS.DASHBOARD}/affiliate/affiliate`,

      new: `${ROOTS.DASHBOARD}/affiliate/new`,
      // affiliate: `${ROOTS.DASHBOARD}/affiliate/affiliate`,
      details: (id) => `${ROOTS.DASHBOARD}/affiliate/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/affiliate/${id}/edit`,
    },

    manage_affiliate: {
      root: `${ROOTS.DASHBOARD}/manage_affiliate`,
      new: `${ROOTS.DASHBOARD}/manage_affiliate/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_affiliate/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_affiliate/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_affiliate/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_affiliate/${MOCK_ID}/edit`,
      },
    },

    manage_campaign: {
      root: `${ROOTS.DASHBOARD}/manage_campaign`,
      new: `${ROOTS.DASHBOARD}/manage_campaign/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_campaign/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_campaign/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_campaign/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_campaign/${MOCK_ID}/edit`,
      },
    },

    // DONE
    users: {
      root: `${ROOTS.DASHBOARD}/users`,
      new: `${ROOTS.DASHBOARD}/users/new`,
      details: (id) => `${ROOTS.DASHBOARD}/users/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/users/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/users/${MOCK_ID}/edit`,
      },
    },
    // DONE
    manage_design: {
      root: `${ROOTS.DASHBOARD}/manage_design`,
      new: `${ROOTS.DASHBOARD}/manage_design/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_design/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_design/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_design/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_design/${MOCK_ID}/edit`,
      },
    },
    manage_customer: {
      edit: (id) => `${ROOTS.DASHBOARD}/customer/${id}/edit`,
    },
    settings: {
      root: `${ROOTS.DASHBOARD}/settings`,
      myprofile: `${ROOTS.DASHBOARD}/settings/myprofile`,
      contactus: `${ROOTS.DASHBOARD}/settings/contactus`,
      aboutus: `${ROOTS.DASHBOARD}/settings/aboutus`,
      changepassword: `${ROOTS.DASHBOARD}/settings/changepassword`,
      activitylog: `${ROOTS.DASHBOARD}/settings/activitylog`,
    },
    // DONE
    customer: {
      root: `${ROOTS.DASHBOARD}/customer`,
      new: `${ROOTS.DASHBOARD}/customer/new`,
      list: `${ROOTS.DASHBOARD}/customer/list`,
      cards: `${ROOTS.DASHBOARD}/customer/cards`,
      profile: `${ROOTS.DASHBOARD}/customer/profile`,
      account: `${ROOTS.DASHBOARD}/customer/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/customer/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/customer/${id}`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/customer/${MOCK_ID}/edit`,
      },
    },
    // DONE
    gift_card: {
      root: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_business`,
      new: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_business/new`,
      details: (id) => `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_business/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_business/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_business/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_business/${MOCK_ID}/edit`,
      },
    },
    // DONE
    people_gift_card: {
      root: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_users`,
      new: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_users/new`,
      details: (id) => `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_users/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_users/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_users/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/giftcard/gift_card-multiple_users/${MOCK_ID}/edit`,
      },
    },
    // DONE
    single_gift_card: {
      root: `${ROOTS.DASHBOARD}/giftcard/gift_card-single`,
      new: `${ROOTS.DASHBOARD}/giftcard/gift_card-single/new`,
      details: (id) => `${ROOTS.DASHBOARD}/giftcard/gift_card-single/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/giftcard/gift_card-single/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/giftcard/gift_card-single/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/giftcard/gift_card-single/${MOCK_ID}/edit`,
      },
    },

    manage_sales: {
      root: `${ROOTS.DASHBOARD}/sales`,
      new: `${ROOTS.DASHBOARD}/sales/new`,
      details: (id) => `${ROOTS.DASHBOARD}/sales/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/sales/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/sales/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/sales/${MOCK_ID}/edit`,
      },
    },

    manage_sales_report: {
      root: `${ROOTS.DASHBOARD}/manage_sales_report`,
      new: `${ROOTS.DASHBOARD}/manage_sales_report/new`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_sales_report/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/manage_sales_report/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_sales_report/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/manage_sales_report/${MOCK_ID}/edit`,
      },
    },

    // manage_inventory: {
    //   root: `${ROOTS.DASHBOARD}/inventory`,
    //   // new: `${ROOTS.DASHBOARD}/inventory/new`,
    //   details: (id) => `${ROOTS.DASHBOARD}/inventory/${id}`,
    //   // edit: (id) => `${ROOTS.DASHBOARD}/inventory/${id}/edit`,
    //   // demo: {
    //   //   details: `${ROOTS.DASHBOARD}/inventory/${MOCK_ID}`,
    //   //   edit: `${ROOTS.DASHBOARD}/inventory/${MOCK_ID}/edit`,
    //   // },
    // },

    manage_batches: {
      root: `${ROOTS.DASHBOARD}/batches`,
      new: `${ROOTS.DASHBOARD}/batches/new`,
      details: (id) => `${ROOTS.DASHBOARD}/batches/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/batches/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/batches/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/batches/${MOCK_ID}/edit`,
      },
    },

    branch_sell: {
      root: `${ROOTS.DASHBOARD}/sell`,
      new: `${ROOTS.DASHBOARD}/sell/new`,
      product: `${ROOTS.DASHBOARD}/sell/products`,
      checkout: `${ROOTS.DASHBOARD}/sell/checkout`,
      review: `${ROOTS.DASHBOARD}/sell/review`,
      details: (id) => `${ROOTS.DASHBOARD}/sell/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/sell/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/sell/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/sell/${MOCK_ID}/edit`,
      },
    },
    replicate: {
      root: `${ROOTS.DASHBOARD}/replicate`,
      new: `${ROOTS.DASHBOARD}/replicate/new`,
      details: (id) => `${ROOTS.DASHBOARD}/replicate/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/replicate/${id}/edit`,
      replicate: (id) => `${ROOTS.DASHBOARD}/replicate/${id}/replicate`,
      demo: {
        details: `${ROOTS.DASHBOARD}/replicate/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/replicate/${MOCK_ID}/edit`,
      },
    },
    log: {
      root: `${ROOTS.DASHBOARD}/logs`,
      new: `${ROOTS.DASHBOARD}/logs/new`,
      details: (id) => `${ROOTS.DASHBOARD}/logs/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/logs/${id}/edit`,
      logs: (id) => `${ROOTS.DASHBOARD}/logs/${id}/logs`,
      demo: {
        details: `${ROOTS.DASHBOARD}/logs/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/logs/${MOCK_ID}/edit`,
      },
    },
    marketing: {
      root: `${ROOTS.DASHBOARD}/marketing`,
      new: (id) => `${ROOTS.DASHBOARD}/marketing/${id}/new`,
      details: (id) => `${ROOTS.DASHBOARD}/marketing/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/marketing/${id}/edit`,
      marketing: (id) => `${ROOTS.DASHBOARD}/marketing/${id}/marketing`,
      demo: {
        details: `${ROOTS.DASHBOARD}/marketing/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/marketing/${MOCK_ID}/edit`,
      },
    },

    warehouse: {
      root: `${ROOTS.DASHBOARD}/warehouse`,
      new: `${ROOTS.DASHBOARD}/warehouse/new`,
      details: (id) => `${ROOTS.DASHBOARD}/warehouse/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/warehouse/${id}/edit`,
      warehouse: (id) => `${ROOTS.DASHBOARD}/warehouse/${id}/warehouse`,
      demo: {
        details: `${ROOTS.DASHBOARD}/warehouse/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/warehouse/${MOCK_ID}/edit`,
      },
    },  
    channelassign: {
      root: `${ROOTS.DASHBOARD}/channelassign`,
      new: `${ROOTS.DASHBOARD}/channelassign/new`,
      details: (id) => `${ROOTS.DASHBOARD}/channelassign/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/channelassign/${id}/edit`,
      channelassign: (id) => `${ROOTS.DASHBOARD}/channelassign/${id}/channelassign`,
      demo: {
        details: `${ROOTS.DASHBOARD}/channelassign/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/channelassign/${MOCK_ID}/edit`,
      },
    },
    offlinesales: {
      root: `${ROOTS.DASHBOARD}/offlinesales`,
      new: `${ROOTS.DASHBOARD}/offlinesales/new`,
      details: (id) => `${ROOTS.DASHBOARD}/offlinesales/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/offlinesales/${id}/edit`,
      offlinesales: (id) => `${ROOTS.DASHBOARD}/offlinesales/${id}/offlinesales`,
      demo: {
        details: `${ROOTS.DASHBOARD}/offlinesales/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/offlinesales/${MOCK_ID}/edit`,
      },
    },
    supportchannel: {
      root: `${ROOTS.DASHBOARD}/supportchannel`,
      new: `${ROOTS.DASHBOARD}/supportchannel/new`,
      details: (id) => `${ROOTS.DASHBOARD}/supportchannel/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/supportchannel/${id}/edit`,
      supportchannel: (id) => `${ROOTS.DASHBOARD}/supportchannel/${id}/supportchannel`,
      demo: {
        details: `${ROOTS.DASHBOARD}/supportchannel/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/supportchannel/${MOCK_ID}/edit`,
      },
    },
    lookforcases: {
      root: `${ROOTS.DASHBOARD}/lookforcases`,
      new: `${ROOTS.DASHBOARD}/lookforcases/new`,
      details: (id) => `${ROOTS.DASHBOARD}/lookforcases/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/lookforcases/${id}/edit`,
      lookforcases: (id) => `${ROOTS.DASHBOARD}/lookforcases/${id}/lookforcases`,
      demo: {
        details: `${ROOTS.DASHBOARD}/lookforcases/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/lookforcases/${MOCK_ID}/edit`,
      },
    },
    customerbilling: {
      root: `${ROOTS.DASHBOARD}/customerbilling`,
      new: `${ROOTS.DASHBOARD}/customerbilling/new`,
      details: (id) => `${ROOTS.DASHBOARD}/customerbilling/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/customerbilling/${id}/edit`,
      customerbilling: (id) => `${ROOTS.DASHBOARD}/customerbilling/${id}/customerbilling`,
      demo: {
        details: `${ROOTS.DASHBOARD}/customerbilling/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/customerbilling/${MOCK_ID}/edit`,
      },
    },
    campaign: {
      root: `${ROOTS.DASHBOARD}/campaign`,
      new: `${ROOTS.DASHBOARD}/campaign/new`,
      details: (id) => `${ROOTS.DASHBOARD}/campaign/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/campaign/${id}/edit`,
      campaign: (id) => `${ROOTS.DASHBOARD}/campaign/${id}/campaign`,
      demo: {
        details: `${ROOTS.DASHBOARD}/campaign/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/campaign/${MOCK_ID}/edit`,
      },
    },

    findreplicationmodel: {
      root: `${ROOTS.DASHBOARD}/findreplicationmodel`,
      new: `${ROOTS.DASHBOARD}/findreplicationmodel/new`,
      details: (id) => `${ROOTS.DASHBOARD}/findreplicationmodel/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/findreplicationmodel/${id}/edit`,
      replicate: (id) => `${ROOTS.DASHBOARD}/findreplicationmodel/${id}/replicate`,
      demo: {
        details: `${ROOTS.DASHBOARD}/findreplicationmodel/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/findreplicationmodel/${MOCK_ID}/edit`,
      },
      model: `${ROOTS.DASHBOARD}/`,
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },

    manage_sell: {
      root: `${ROOTS.DASHBOARD}/manage_sell`,
      details: (id) => `${ROOTS.DASHBOARD}/manage_sell/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/manage_sell/${MOCK_ID}`,
      },
    },

    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
    dmasthead: {
      root: `${ROOTS.DASHBOARD}/dmasthead`,
      new: `${ROOTS.DASHBOARD}/dmasthead/new`,
      details: (id) => `${ROOTS.DASHBOARD}/dmasthead/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/dmasthead/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/dmasthead/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/dmasthead/${MOCK_ID}/edit`,
      },
    },
    mmasthead: {
      root: `${ROOTS.DASHBOARD}/mmasthead`,
      new: `${ROOTS.DASHBOARD}/mmasthead/new`,
      details: (id) => `${ROOTS.DASHBOARD}/mmasthead/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/mmasthead/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/mmasthead/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/mmasthead/${MOCK_ID}/edit`,
      },
    },
    faq: {
      root: `${ROOTS.DASHBOARD}/faq`,
      new: `${ROOTS.DASHBOARD}/faq/new`,
      details: (id) => `${ROOTS.DASHBOARD}/faq/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/faq/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/faq/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/faq/${MOCK_ID}/edit`,
      },
    },
    blog_category: {
      root: `${ROOTS.DASHBOARD}/blog_category`,
      new: `${ROOTS.DASHBOARD}/blog_category/new`,
      details: (id) => `${ROOTS.DASHBOARD}/blog_category/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/blog_category/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/blog_category/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/blog_category/${MOCK_ID}/edit`,
      },
    },
    blogs: {
      root: `${ROOTS.DASHBOARD}/blogs`,
      new: `${ROOTS.DASHBOARD}/blogs/new`,
      details: (id) => `${ROOTS.DASHBOARD}/blogs/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/blogs/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/blogs/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/blogs/${MOCK_ID}/edit`,
      },
    },
    pagesdata: {
      root: `${ROOTS.DASHBOARD}/pagesdata`,
      new: `${ROOTS.DASHBOARD}/pagesdata/new`,
      details: (id) => `${ROOTS.DASHBOARD}/pagesdata/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/pagesdata/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/pagesdata/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/pagesdata/${MOCK_ID}/edit`,
      },
    },
  },
};
