import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url || "";


    const isAuthEndpoint =
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => API(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await API.post("/auth/refresh");
      processQueue(null);
      return API(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export interface VerifyRegisterPayload {
  email: string;
  otp: string;
}

export const verifyRegister = async (data: VerifyRegisterPayload) => {
  const response = await API.post("/auth/verify-register", data);
  return response.data;
};

export const registrationSuccessful = async () => {
  const response = await API.get("/auth/successfull");
  return response.data;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
}

export const updateProfile = async (data: UpdateProfilePayload) => {
  const response = await API.patch("/auth/me", data);
  return response.data;
};

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordPayload) => {
  const response = await API.patch("/auth/me/password", data);
  return response.data;
};


export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const forgotPassword = async (data: ForgotPasswordPayload) => {
  const response = await API.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  const response = await API.post("/auth/reset-password", data);
  return response.data;
};

export default API;