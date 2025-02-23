import React, { useEffect, useState, useRef } from "react";
import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { basicSetup } from "codemirror";
import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { WebsocketProvider } from "y-websocket";

export interface CollaborativeCodeMirrorProps {
  user: UserProfile;
  session: Session;
}

export default function CollaborativeCodeMirror({
  user,
  session,
}: CollaborativeCodeMirrorProps) {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [docValue, setDocValue] = useState<string>("\n\n\n");

  // Store Y.Doc and provider in refs so they persist across renders.
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  // Effect to initialize Y.Doc, provider, and collab binding (runs once)
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create provider with your signaling URL and room name.
    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      session._id,
      ydoc
    );
    providerRef.current = provider;

    const ytext = ydoc.getText("codemirror");
    const undoManager = new Y.UndoManager(ytext);

    // Set the local awareness using your authenticated user.
    provider.awareness.setLocalStateField("user", user);

    // Create the collaborative binding from y-codemirror.next.
    const collabExtension = yCollab(ytext, provider.awareness, { undoManager });
    setExtensions([basicSetup, javascript(), collabExtension]);

    // Observe changes on Y.Text to update local state.
    const updateHandler = () => {
      const newVal = ytext.toString();
      console.log("Y.Text updated:", newVal);
      setDocValue(newVal);
    };
    ytext.observe(updateHandler);

    // For debugging, log awareness changes.
    provider.awareness.on("change", () => {
      console.log("Awareness states:", provider.awareness.getStates());
    });

    // Cleanup only when component unmounts.
    return () => {
      ytext.unobserve(updateHandler);
      provider.disconnect();
      ydoc.destroy();
    };
  }, [user]); // Empty dependency ensures this runs only once

  // Separate effect to update awareness when user prop changes.
  useEffect(() => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField("user", user);
    }
  }, [user]);

  return (
    <div>
      <CodeMirror
        value={docValue}
        height="300px"
        theme="dark"
        extensions={extensions}
        onChange={(value: string) => {
          setDocValue(value);
          console.log("Local editor change:", value);
        }}
      />
    </div>
  );
}
