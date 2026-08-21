import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export interface CreateWorkspacePayload {
  name: string;
  icon?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  icon?: string;
}

export const getWorkspaces = async () => {
  const res = await API.get("/workspaces");
  return res.data;
};

export const getWorkspace = async (id: string) => {
  const res = await API.get(`/workspaces/${id}`);
  return res.data;
};

export const createWorkspace = async (
  data: CreateWorkspacePayload
) => {
  const res = await API.post("/workspaces", data);
  return res.data;
};

export const updateWorkspace = async (
  id: string,
  data: UpdateWorkspacePayload
) => {
  const res = await API.patch(`/workspaces/${id}`, data);
  return res.data;
};

export const deleteWorkspace = async (id: string) => {
  const res = await API.delete(`/workspaces/${id}`);
  return res.data;
};