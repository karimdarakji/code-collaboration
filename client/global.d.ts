import { SessionVisibility } from "./contants";

declare global {
  interface Window {
    google?: unknown;
  }

  interface UserProfile {
    _id: ObjectId;
    name: string;
    avatar: string;
  }

  interface Session {
    _id: string;
    slug: string;
    participants: UserProfile[];
    title: string;
    description: string;
    visibility: SessionVisibility;
  }

  interface QueryParams {
    sessionId?: string;
  }
}

export {};
