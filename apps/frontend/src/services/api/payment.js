import http from "@/services/http";

export const paymentAPI = {
  create: (data) => http.post("/payments/create", data),
  rechargeCard: (data) => http.post("/payments/recharge-card", data),
  getMyPayments: (params) => http.get("/payments/my-payments", { params }),
};


