declare namespace Express {
  interface Request {
    auth?: {
      userId: string;
      role: "USER" | "EDITOR" | "ADMIN";
    };
  }
}
