export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };

  accessToken: string;

  refreshToken: string;
}