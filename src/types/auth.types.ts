export type registerType = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "developer";
};
export type loginType = { 
  email: string;
  password: string;
};
export interface tokenObject {
    email:string,
    role:string,
    id:string
}

declare global {
  namespace Express {
    interface Request {
      user?: tokenObject; 
    }
  }
}