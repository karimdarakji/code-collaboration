import React, { useState } from "react";
import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import Button from "../Button";
import {
  useCreateSessionInvitation,
  useDeleteSessionInvitation,
} from "@/app/api/invitations";
import { useGetSession } from "@/app/api/sessions";
import { ButtonVariant, InvitationStatus } from "@/contants";

interface InvitationModalProps {
  sessionId: string;
  onClose: () => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({
  sessionId,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const { data: session, isLoading, refetch } = useGetSession({ sessionId });
  const { mutate: createSessionInvitation } = useCreateSessionInvitation();
  const { mutate: deleteSessionInvitation } = useDeleteSessionInvitation();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email.trim());

  const handleSessionInvitation = () => {
    if (!isValidEmail || !session) return;
    createSessionInvitation(
      {
        email,
        sessionId: session._id,
      },
      {
        onSuccess: () => {
          refetch();
          setEmail("");
        },
      }
    );
  };

  const handleSessionInvitationDelete = (email: string) => {
    if (!session) return;
    deleteSessionInvitation(
      {
        id: session._id,
        email,
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  if (isLoading || !session) {
    return null;
  }
  return (
    <Modal>
      <ModalContent>
        <ModalHeader
          title={`Invitations for ${session.title}`}
          onClose={onClose}
        />
        <ModalBody>
          <div className="mt-3 flex items-center gap-2 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter invitee email"
              className="border rounded px-3 py-2 flex-1"
            />
            <Button
              text="Add"
              onClick={handleSessionInvitation}
              disabled={!email.trim() || !isValidEmail}
            />
          </div>
          <div className="mt-4">
            {session.invitations && session.invitations.length > 0 ? (
              session.invitations.map((invite, index) => (
                <div
                  key={index}
                  className="flex items-center border p-2 rounded my-1"
                >
                  <div>
                    <p className="font-semibold">{invite.email}</p>
                    <p
                      className={`text-sm ${
                        invite.status === InvitationStatus.ACCEPTED
                          ? "text-green-600"
                          : invite.status === InvitationStatus.DECLINED
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {invite.status.charAt(0).toUpperCase() +
                        invite.status.slice(1)}
                    </p>
                  </div>
                  <div className="ms-auto flex gap-2">
                    {invite.status === InvitationStatus.PENDING && (
                      <Button
                        text="Resend"
                        variant={ButtonVariant.SECONDARY}
                        onClick={() => {
                          // TODO: Implement resend functionality
                          console.log("Resend invitation to:", invite.email);
                        }}
                      />
                    )}
                    <Button
                      variant={ButtonVariant.DANGER}
                      text="Remove"
                      onClick={() =>
                        handleSessionInvitationDelete(invite.email)
                      }
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No invitations yet.</p>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvitationModal;
