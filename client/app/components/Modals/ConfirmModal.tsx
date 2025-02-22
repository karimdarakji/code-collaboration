import React from "react";
import Modal from "./Modal";
import ModalHeader from "./ModalHeader";
import ModalContent from "./ModalContent";
import ModalBody from "./ModalBody";
import Button from "../Button";
import { ButtonVariant } from "@/contants";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader title={title} onClose={onCancel} />
        <ModalBody>
          <p className="mb-4">{message}</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant={ButtonVariant.SECONDARY}
              text="Cancel"
              onClick={onCancel}
            />
            <Button
              variant={ButtonVariant.DANGER}
              text="Delete"
              onClick={onConfirm}
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
