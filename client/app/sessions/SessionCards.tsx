import React, { useState } from "react";
import Avatars from "../components/Avatars/Avatars";
import Button from "../components/Button";
import { useRouter } from "next/navigation";
import { useDeleteSession, useGetSessions } from "../api/sessions";
import ExitButton from "../components/Buttons/ExitButton";
import ConfirmModal from "../components/Modals/ConfirmModal";

const SessionCards = () => {
  const router = useRouter();
  const { data, isPending } = useGetSessions();
  const { mutate: deleteSession } = useDeleteSession();

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
    }
    setShowConfirmModal(false);
    setSessionToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setSessionToDelete(null);
  };

  if (isPending) {
    return null;
  }

  return (
    <>
      <div className="flex gap-6">
        {data?.map((session) => (
          <div
            key={session._id}
            className="group relative rounded hover:shadow-lg transition max-w-sm p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 w-[36rem]"
          >
            <ExitButton
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => handleDeleteClick(session._id)}
            />
            <h2 className="text-xl font-semibold text-white">
              {session.title}
            </h2>
            <p className="mt-2">{session.description}</p>
            <Avatars participants={session.participants} />
            <div className="mt-4 text-right">
              <Button
                text="Join session"
                onClick={() => router.push(`/sessions/${session._id}`)}
              />
            </div>
          </div>
        ))}
      </div>
      {showConfirmModal && (
        <ConfirmModal
          title="Confirm Deletion"
          message="Are you sure you want to delete this session?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default SessionCards;
