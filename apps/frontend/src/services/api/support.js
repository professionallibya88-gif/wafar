import http from "@/services/http";

export const supportAPI = {
  // --- قنوات الدعم (Support Channels) ---
  // للمستخدمين (القنوات النشطة)
  getActiveChannels: () => http.get("/support-channels/public"),

  // للمديرين
  getChannels: (params) => http.get("/support-channels", { params }),
  createChannel: (data) => http.post("/support-channels", data),
  updateChannel: (id, data) => http.put(`/support-channels/${id}`, data),
  deleteChannel: (id) => http.delete(`/support-channels/${id}`),
  toggleChannelActive: (id) => http.patch(`/support-channels/${id}/toggle-active`),

  // --- تذاكر الدعم (Support Tickets) ---
  // للمستخدمين
  getMyTickets: (params) => http.get("/support-tickets/my-tickets", { params }),
  createTicket: (data) => http.post("/support-tickets/my-tickets", data),
  getMyTicketDetails: (id) => http.get(`/support-tickets/my-tickets/${id}`),
  replyToMyTicket: (id, data) => http.post(`/support-tickets/my-tickets/${id}/reply`, data),

  // للمديرين
  getAdminTickets: (params) => http.get("/support-tickets/admin", { params }),
  getAdminTicketDetails: (id) => http.get(`/support-tickets/admin/${id}`),
  replyToAdminTicket: (id, data) => http.post(`/support-tickets/admin/${id}/reply`, data),
  updateTicketStatus: (id, status) => http.patch(`/support-tickets/admin/${id}/status`, { status }),
};
