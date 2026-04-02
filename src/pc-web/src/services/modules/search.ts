import { httpClient } from "@/services/http/client";

export const recordSearch = async (keyword: string) => {
  await httpClient.post("/search/record", { keyword });
};

export const listHotKeywords = async (limit: number = 10): Promise<string[]> => {
  const response = await httpClient.get<{ code: number; data: string[]; msg: string }>("/search/hot", {
    params: { limit },
  });
  return response.data;
};
