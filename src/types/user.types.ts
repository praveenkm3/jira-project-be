export type usersReturnType = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Notification = {
  notification_id: string;
  message: string;
  is_read: boolean;
  createdAt: string;
};
