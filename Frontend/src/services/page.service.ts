import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export interface CreatePagePayload {
  workspaceId: string;
  title?: string;
  parentId?: string | null;
  icon?: string;
}

export interface UpdatePagePayload {
  title?: string;
  icon?: string;
  coverImage?: string;
}

export interface MovePagePayload {
  parentId?: string | null;
  position?: number;
}

export const getPages = async (workspaceId: string) => {
  const res = await API.get(`/pages/workspace/${workspaceId}`);
  return res.data;
};

export const getPage = async (id: string) => {
  const res = await API.get(`/pages/${id}`);
  return res.data;
};

export const createPage = async (data: CreatePagePayload) => {
  const res = await API.post("/pages", data);
  return res.data;
};

export const updatePage = async (
  id: string,
  data: UpdatePagePayload
) => {
  const res = await API.patch(`/pages/${id}`, data);
  return res.data;
};

export const deletePage = async (id: string) => {
  const res = await API.delete(`/pages/${id}`);
  return res.data;
};

export const movePage = async (
  id: string,
  data: MovePagePayload
) => {
  const res = await API.patch(`/pages/${id}/move`, data);
  return res.data;
};


export const getPageContent = async (id: string) => {
  const res = await API.get(`/pages/${id}/content`);
  return res.data;
};

export const updatePageContent = async (
  id: string,
  content: any
) => {
  const res = await API.put(`/pages/${id}/content`, { content });
  return res.data;
};


export const getTrash = async () => {
  const res = await API.get("/pages/trash");
  return res.data;
};

export const restorePage = async (id: string) => {
  const res = await API.patch(`/pages/${id}/restore`);
  return res.data;
};

export const permanentDeletePage = async (id: string) => {
  const res = await API.delete(`/pages/${id}/permanent`);
  return res.data;
};