"use client";
import { useGetSession } from "@/app/api/sessions";
import { useAuth } from "@/app/contexts/AuthContext";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React from "react";

// Dynamically import the collaborative editor (client‑side only).
const DynamicCollaborativeCodeMirror = dynamic(
  () => import("../../components/CodeMirrorEditor"),
  { ssr: false }
);

const Session = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();

  const { data: session, isPending } = useGetSession({ sessionId });

  if (isPending || !session || !user) {
    return null;
  }

  return (
    <div className="p-4">
      {/* Top Section: Session Title and Description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
        <p className="text-white">{session.description}</p>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Left Half: Custom Editor */}
        <div className="w-1/2">
          <DynamicCollaborativeCodeMirror user={user} session={session} />
        </div>
        {/* Right Half: Empty (or add additional content if needed) */}
        <div className="w-1/2"></div>
      </div>
    </div>
  );
};

export default Session;
