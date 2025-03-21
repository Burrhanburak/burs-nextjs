// export const siteConfig = {
//   name: "Insights",
//   url: "https://insights.tremor.so",
//   description: "The only reporting and audit dashboard you will ever need.",
//   baseLinks: {
//     reports: "/reports",
//     transactions: "/transactions",
//     settings: {
//       audit: "/settings/audit",
//       users: "/settings/users",
//       billing: "/settings/billing",
//     },
//     login: "/login",
//     onboarding: "/onboarding/products",
//   },
// }

// export type siteConfig = typeof siteConfig



export const AdminSiteConfig = {
  name: "admin",
  url: "localhost:3000",
  description: "Burs Başvuru Sistemi Admin Paneli",
  admin: {
    dashboard: "/admin/dashboard",
    settings: {
      users: "/admin/settings/users",
      audit: "/admin/settings/audit",
      bursiyerStatus: "/admin/bursiyer-status",
    },
    documents: "/admin/documents",
    applicants: "/admin/applicants",
    bursiyerStatus: "/admin/bursiyer-status",
    interviews: "/admin/interviews",
  },
}
export type AdminSiteConfig = typeof AdminSiteConfig


// export const BursiyerSiteConfig = {
//   name: "Insights",
//   url: "https://insights.tremor.so",
//   description: "The only reporting and audit dashboard you will ever need.",
//   baseLinks: {
//     reports: "/reports",
//     transactions: "/transactions",
//     settings: {
//       audit: "/settings/audit",
//       users: "/settings/users",
//       billing: "/settings/billing",
//     },
//     login: "/login",
//     onboarding: "/onboarding/products",
//   },
// }
// export type BursiyerSiteConfig = typeof BursiyerSiteConfig


export const siteConfig = {
  name: "Burs Başvuru Sistemi",
  description: "Online burs başvuru ve yönetim sistemi",
  url: "https://burs-basvuru.com",
  ogImage: "https://burs-basvuru.com/og.jpg",
  links: {
    base: {
      home: "/",
      login: "/auth/login",
      signup: "/auth/signup",
    },
    dashboard: {
      home: "/",
      profile: "/profile",
      documents: "/documents",
      applications: "/applications",
      notifications: "/notifications",
    },
    admin: {
      home: "/admin",
      applicants: "/admin/applicants",
      documents: "/admin/documents",
      interviews: "/admin/interviews",
      settings: "/admin/settings",
      reports: "/admin/reports",
    },
  },
  navigation: {
    main: [
      {
        title: "Ana Sayfa",
        href: "/",
      },
      {
        title: "Hakkımızda",
        href: "/about",
      },
      {
        title: "İletişim",
        href: "/contact",
      },
    ],
    dashboard: [
      {
        title: "Başvurularım",
        href: "/applications",
      },
      {
        title: "Evraklarım",
        href: "/documents",
      },
      {
        title: "Bildirimler",
        href: "/notifications",
      },
      {
        title: "Profilim",
        href: "/profile",
      },
    ],
    admin: [
      {
        title: "Başvurular",
        href: "/admin/applicants",
      },
      {
        title: "Evraklar",
        href: "/admin/documents",
      },
      {
        title: "Mülakatlar",
        href: "/admin/interviews",
      },
      {
        title: "Raporlar",
        href: "/admin/reports",
      },
      {
        title: "Ayarlar",
        href: "/admin/settings",
      },
    ],
  },
}

export type siteConfig = typeof siteConfig
