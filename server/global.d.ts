declare global {
  interface AuthenticatedRequest extends Request {
    user: {
      userId: string;
      email: string;
    };
    cookies: {
      accessToken: string;
      refreshToken: string;
    };
  }
}

export {};
