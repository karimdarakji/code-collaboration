declare global {
    interface Window {
      google?: any;
    }

    interface UserProfile {
      _id: ObjectId;
      name: string;
      avatar: string;
    }
}

export {};