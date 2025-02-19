declare global {
    interface Window {
      google?: any;
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
    }
}

export {};