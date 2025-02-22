"use client";

import { AlertVariant, ButtonVariant, SessionVisibility } from "@/contants";
import React, { FormEvent, useState } from "react";
import Button from "../components/Button";
import { useRouter } from "next/navigation";
import ModalContent from "../components/Modals/ModalContent";
import ModalHeader from "../components/Modals/ModalHeader";
import ModalBody from "../components/Modals/ModalBody";
import Modal from "../components/Modals/Modal";
import Alert from "../components/Alerts/Alert";
import { useCreateSession } from "../api/sessions";

interface CreateSessionModalProps {
  show: boolean;
  onClose: () => void;
}
const CreateSessionModal = ({ show, onClose }: CreateSessionModalProps) => {
  const router = useRouter();
  const [session, setSession] = useState({
    title: "",
    description: "",
    visibility: SessionVisibility.PUBLIC,
  });

  const { mutate: createSession, isError, error } = useCreateSession();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session.title) {
      return;
    }
    createSession(
      {
        title: session.title,
        description: session.description,
        visibility: session.visibility,
      },
      {
        onSuccess: (data: Session) => {
          router.push(`/sessions/${data.slug}`);
        },
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setSession({
      ...session,
      [e.target.name]: e.target.value,
    });
  };

  if (!show) {
    return null;
  }

  return (
    <Modal>
      <ModalContent>
        {isError && error && (
          <Alert
            variant={AlertVariant.DANGER}
            title="Error!"
            message={error.message || "An error occurred"}
          />
        )}
        <ModalHeader title="Create New Session" onClose={onClose} />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <label className="block mb-1 text-white" htmlFor="title">
              Session Title
            </label>
            <input
              name="title"
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              value={session.title}
              onChange={handleChange}
              required
            />
            <label className="block mb-1 text-white" htmlFor="description">
              Description
            </label>
            <textarea
              name="description"
              className="w-full border rounded px-3 py-2 mb-4"
              value={session.description}
              onChange={handleChange}
              rows={3}
            />
            <label className="block mb-1 text-white">Visibility</label>
            <select
              name="visibility"
              value={session.visibility}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value={SessionVisibility.PUBLIC}>Public</option>
              <option value={SessionVisibility.PRIVATE}>Private</option>
            </select>
            <div className="flex justify-end space-x-2">
              <Button
                variant={ButtonVariant.SECONDARY}
                text="Cancel"
                onClick={onClose}
              />
              <Button type="submit" text="Create Session" />
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateSessionModal;
