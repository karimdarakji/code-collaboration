"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetSessionByInvitationToken,
  useUpdateInvitationStatus,
} from "@/app/api/invitations";
import { InvitationStatus } from "@/contants";
import Button from "@/app/components/Button";
import { ButtonVariant } from "@/contants";

const InvitationResponsePage = () => {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: session,
    isLoading,
    error,
  } = useGetSessionByInvitationToken(token);
  const { mutate: updateInvitationStatus } = useUpdateInvitationStatus();

  const handleAccept = () => {
    if (!session) return;
    setIsProcessing(true);
    updateInvitationStatus(
      {
        sessionId: session._id,
        token,
        status: InvitationStatus.ACCEPTED,
      },
      {
        onSuccess: () => {
          // Redirect to the session page
          router.push(`/sessions/${session._id}`);
        },
        onError: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const handleDecline = () => {
    if (!session) return;
    setIsProcessing(true);
    updateInvitationStatus(
      {
        sessionId: session._id,
        token,
        status: InvitationStatus.DECLINED,
      },
      {
        onSuccess: () => {
          // Redirect to sessions page
          router.push("/sessions");
        },
        onError: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-4">
            This invitation link is invalid or has expired.
          </p>
          <Button
            text="Go to Sessions"
            onClick={() => router.push("/sessions")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Session Invitation
          </h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {session.title}
            </h2>
            {session.description && (
              <p className="text-gray-600 mb-4">{session.description}</p>
            )}
            <div className="text-sm text-gray-500">
              <p>You&apos;ve been invited to join this coding session.</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              text="Accept Invitation"
              onClick={handleAccept}
              disabled={isProcessing}
            />
            <Button
              variant={ButtonVariant.SECONDARY}
              text="Decline Invitation"
              onClick={handleDecline}
              disabled={isProcessing}
            />
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Processing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationResponsePage;
