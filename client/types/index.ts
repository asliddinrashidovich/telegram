export interface ChildProps {
  children: React.ReactNode;
}

export interface IError {
  response: {
    data: {
      message: string;
    };
  };
}

export interface Iuser {
  email: string;
  _id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  bio: string;
  isVerified: boolean;
  muted: boolean;
  notificationSound: string;
  sendingSound: string;
  contacts: Iuser[];
}

export interface IMessage {
  _id: string;
  created_at: string;
  updated_at: string;
  text: string;
  image: string;
  reaction: string;
  sender: Iuser;
  receiver: Iuser;
}
