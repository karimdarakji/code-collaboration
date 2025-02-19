import React from "react";
import Avatars from "../components/Avatars/Avatars";
import Button from "../components/Button";
import { useRouter } from "next/navigation";
import { useGetSessions } from "../api/sessions";

const SessionCards = () => {
  const router = useRouter();
  const { data, isPending } = useGetSessions();

  if (isPending) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.map((session) => (
        <div key={session._id} className="rounded hover:shadow-lg transition max-w-sm p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-white">{session.title}</h2>
          <p className="mt-2">{session.description}</p>
          <Avatars participants={session.participants} />
          <div className="mt-4 text-right">
            <Button
              text="Join session"
              onClick={() => router.push("sessionId")}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionCards;
