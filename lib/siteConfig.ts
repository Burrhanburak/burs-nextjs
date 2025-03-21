

export const siteConfig = {
  title: "Burs Yönetim Sistemi",
  description: "Burs başvuruları ve ödemelerini yönetmenizi sağlayan sistem",
  baseLinks: {
    settings: {
      index: "/admin/settings",
      audit: "/admin/settings/audit",
      bursiyer: "/admin/settings/bursiyer-bilgileri",
      users: "/admin/settings/users",
    },
    admin: {
      dashboard: "/admin/dashboard",
      applicants: "/admin/applicants",
      interviews: "/admin/interviews",
      documents: "/admin/documents",
      reports: "/admin/reports",
      bursiyerStatus: "/admin/bursiyer-status",
    }
  }
} 