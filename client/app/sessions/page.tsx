"use client";
import Button from "../components/Button";
import { useState } from "react";
import CreateSessionModal from "./CreateSessionModal";
import SessionCards from "./SessionCards";

const Sessions = () => {
  const [showCreate, setShowCreate] = useState(false);
  
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

        <SessionCards />
      </div>
      <CreateSessionModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
};

export default Sessions;
