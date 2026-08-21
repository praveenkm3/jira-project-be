export type registerType = {
  name: string;
  email: string;
  password: string;
  role: string;
  designation_id: string;
};
export type loginType = {
  email: string;
  password: string;
};
export interface tokenObject {
  email: string;
  role: string;
  id: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: tokenObject;
    }
  }
}
