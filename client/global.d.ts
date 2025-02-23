import { InvitationStatus, SessionVisibility } from "./contants";

declare global {
  interface Window {
    google?: unknown;
  }

  interface UserProfile {
    _id: ObjectId;
    name: string;
    email: string;
    avatar: string;
  }

  interface Session {
    _id: string;
    slug: string;
    participants: UserProfile[];
    title: string;
    description: string;
    visibility: SessionVisibility;
    invitations: Invitation[];
  }

  interface Invitation {
    email: string;
    token: string;
    status: InvitationStatus;
  }

  interface QueryParams {
    sessionId?: string;
  }
}

export {};
