import http from "@/services/http";

export const masterDataAPI = {
  getMasterData: () => http.get("/v1/master-data"),
};
