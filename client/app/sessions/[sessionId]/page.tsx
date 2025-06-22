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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Section: Session Title and Description */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-2">{session.title}</h1>
        <p className="text-gray-300">{session.description}</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Full Width: Collaborative Editor */}
        <div className="w-full">
          <DynamicCollaborativeCodeMirror user={user} session={session} />
        </div>
      </div>
    </div>
  );
};

export default Session;
