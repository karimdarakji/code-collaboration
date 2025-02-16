"use client";
import { useRouter } from "next/navigation";
import Avatars from "../components/Avatars/Avatars";
import Button from "../components/Button";
import { useState } from "react";
import CreateSessionModal from "./CreateSessionModal";

const Sessions = () => {
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const participants = [
    {
      _id: "123456",
      name: "Karim Darakji",
      avatar: "/image.png",
    },
    {
      _id: "1234567",
      name: "testing user",
      avatar: "/image-1.png",
    },
    {
      _id: "12345678",
      name: "testing user 2",
      avatar: "/image-2.png",
    },
  ];
  return (
    <>
      <div className="min-h-screen p-6">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white">
            Your Sessions
          </h1>
          <Button
            text="Create New Session"
            onClick={() => setShowCreate(true)}
          />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="shadow rounded hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-white">
                Session Title
              </h2>
              <p className="mt-2">
                A brief description or preview of the session...
              </p>
              <Avatars participants={participants} />
              <div className="mt-4 text-right">
                <Button
                  text="Join session"
                  onClick={() => router.push("sessionId")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateSessionModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
};

export default Sessions;
