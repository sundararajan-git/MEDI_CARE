export type ErrorToastType = {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
  name?: string;
  stack?: string;
};

export type UserType = {
  id: string;
  email: string;
  profilePic: string;
  isVerified: boolean;
  isLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  lastLogin: Date;
};
