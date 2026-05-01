import http from "@/services/http";

export const subscriptionAPI = {
  getPlans: () => http.get("/subscriptions/plans"),
  getMySubscription: () => http.get("/subscriptions/my-subscription"),
  getMySubscriptions: () => http.get("/subscriptions/my-subscriptions"),
};


