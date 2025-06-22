import React, { useEffect, useState, useRef } from "react";
import CodeMirror, { Extension, ViewUpdate } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { basicSetup } from "codemirror";
import { io, Socket } from "socket.io-client";
import Button from "./Button";

export interface CollaborativeCodeMirrorProps {
  user: UserProfile;
  session: Session;
}

interface CursorPosition {
  line: number;
  ch: number;
  user: UserProfile;
}

interface Selection {
  from: number;
  to: number;
  user: UserProfile;
}

export default function CollaborativeCodeMirror({
  user,
  session,
}: CollaborativeCodeMirrorProps) {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [docValue, setDocValue] = useState<string>(
    "// Start coding here...\nconsole.log('Hello, World!');"
  );
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Store socket in ref so it persists across renders
  const socketRef = useRef<Socket | null>(null);
  const lastChangeRef = useRef<string>("");

  // Effect to initialize socket connection (runs once)
  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io("http://localhost:8000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Set up event listeners
    socket.on("connect", () => {
      setIsConnected(true);

      // Join the session room
      socket.emit("joinRoom", {
        sessionId: session._id,
        user: user,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on(
      "codeUpdate",
      (data: { sessionId: string; delta: string; user: UserProfile }) => {
        if (data.sessionId === session._id && data.user._id !== user._id) {
          setDocValue(data.delta);
        }
      }
    );

    socket.on(
      "cursorUpdate",
      (data: { sessionId: string; cursor: CursorPosition }) => {
        if (
          data.sessionId === session._id &&
          data.cursor.user._id !== user._id
        ) {
          setCursors((prev) => {
            const filtered = prev.filter(
              (c) => c.user._id !== data.cursor.user._id
            );
            return [...filtered, data.cursor];
          });
        }
      }
    );

    socket.on(
      "selectionUpdate",
      (data: { sessionId: string; selection: Selection }) => {
        if (
          data.sessionId === session._id &&
          data.selection.user._id !== user._id
        ) {
          setSelections((prev) => {
            const filtered = prev.filter(
              (s) => s.user._id !== data.selection.user._id
            );
            return [...filtered, data.selection];
          });
        }
      }
    );

    socket.on(
      "selectionClear",
      (data: { sessionId: string; userId: string }) => {
        if (data.sessionId === session._id && data.userId !== user._id) {
          setSelections((prev) =>
            prev.filter((s) => s.user._id !== data.userId)
          );
        }
      }
    );

    socket.on(
      "participantsUpdate",
      (data: { sessionId: string; participants: UserProfile[] }) => {
        if (data.sessionId === session._id) {
          setParticipants(data.participants);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [session._id, user]);

  // Set up CodeMirror extensions
  useEffect(() => {
    setExtensions([basicSetup, javascript()]);
  }, []);

  const handleCodeChange = (value: string) => {
    setDocValue(value);

    // Debounce the change to avoid too many socket emissions
    if (socketRef.current && isConnected && value !== lastChangeRef.current) {
      lastChangeRef.current = value;

      socketRef.current.emit("codeUpdate", {
        sessionId: session._id,
        delta: value,
        user: user,
      });
    }
  };

  const handleCursorChange = (view: ViewUpdate["view"]) => {
    if (socketRef.current && isConnected) {
      const pos = view.state.selection.main.head;
      const line = view.state.doc.lineAt(pos);

      const cursor: CursorPosition = {
        line: line.number,
        ch: pos - line.from,
        user: user,
      };

      socketRef.current.emit("cursorUpdate", {
        sessionId: session._id,
        cursor: cursor,
      });
    }
  };

  const handleSelectionChange = (view: ViewUpdate["view"]) => {
    if (socketRef.current && isConnected) {
      const selection = view.state.selection.main;

      // Clear previous selections for this user
      setSelections((prev) => prev.filter((s) => s.user._id !== user._id));

      if (selection.from !== selection.to) {
        const sel: Selection = {
          from: selection.from,
          to: selection.to,
          user: user,
        };

        socketRef.current.emit("selectionUpdate", {
          sessionId: session._id,
          selection: sel,
        });
      } else {
        // No selection, clear it
        socketRef.current.emit("selectionClear", {
          sessionId: session._id,
          userId: user._id,
        });
      }
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setConsoleOutput([]);

    try {
      // Create a safe execution environment
      const logs: string[] = [];
      const originalConsoleLog = console.log;

      // Override console.log to capture output
      console.log = (...args: unknown[]) => {
        const output = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(" ");
        logs.push(output);
        originalConsoleLog(...args);
      };

      // Execute the code in a safe way
      const code = docValue;
      new Function(code)();

      // Restore original console.log
      console.log = originalConsoleLog;

      setConsoleOutput(logs);
    } catch (error) {
      setConsoleOutput([`Error: ${error}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const getParticipantColor = (participantId: string) => {
    const colors = [
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-violet-500",
      "bg-fuchsia-500",
      "bg-sky-500",
      "bg-lime-500",
    ];
    const index = participants.findIndex((p) => p._id === participantId);
    return colors[index % colors.length];
  };

  const getParticipantBorderColor = (participantId: string) => {
    const colors = [
      "border-cyan-400",
      "border-emerald-400",
      "border-amber-400",
      "border-rose-400",
      "border-violet-400",
      "border-fuchsia-400",
      "border-sky-400",
      "border-lime-400",
    ];
    const index = participants.findIndex((p) => p._id === participantId);
    return colors[index % colors.length];
  };

  const getParticipantBgColor = (participantId: string) => {
    const colors = [
      "bg-cyan-200/40",
      "bg-emerald-200/40",
      "bg-amber-200/40",
      "bg-rose-200/40",
      "bg-violet-200/40",
      "bg-fuchsia-200/40",
      "bg-sky-200/40",
      "bg-lime-200/40",
    ];
    const index = participants.findIndex((p) => p._id === participantId);
    return colors[index % colors.length];
  };

  const getParticipantGlowColor = (participantId: string) => {
    const colors = [
      "shadow-cyan-400/80",
      "shadow-emerald-400/80",
      "shadow-amber-400/80",
      "shadow-rose-400/80",
      "shadow-violet-400/80",
      "shadow-fuchsia-400/80",
      "shadow-sky-400/80",
      "shadow-lime-400/80",
    ];
    const index = participants.findIndex((p) => p._id === participantId);
    return colors[index % colors.length];
  };

  // Get accurate cursor position using CodeMirror's coordinate system
  const getCursorPosition = (line: number, ch: number) => {
    // Use simple, stable positioning that doesn't jump
    return {
      top: (line - 1) * 19 + 19,
      left: ch * 8.5 + 60,
    };
  };

  // Get accurate selection position using CodeMirror's coordinate system
  const getSelectionPosition = (from: number, to: number) => {
    // Calculate line and character position from the 'from' position
    const lines = docValue.split("\n");
    let currentPos = 0;
    let startLine = 1;
    let startCh = 0;

    // Find the line and character position for the start of selection
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentPos + lineLength > from) {
        startLine = i + 1;
        startCh = from - currentPos;
        break;
      }
      currentPos += lineLength;
    }

    // Calculate line and character position for the end of selection
    let endLine = startLine;
    let endCh = startCh;
    currentPos = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentPos + lineLength > to) {
        endLine = i + 1;
        endCh = to - currentPos;
        break;
      }
      currentPos += lineLength;
    }

    // Ensure startLine is always the smaller line number (top to bottom)
    if (startLine > endLine) {
      [startLine, endLine] = [endLine, startLine];
      [startCh, endCh] = [endCh, startCh];
    }

    // Create highlight elements for each line
    const highlights = [];

    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      let lineStartCh = 0;
      let lineEndCh = lines[lineNum - 1].length;

      // Adjust for first line
      if (lineNum === startLine) {
        lineStartCh = startCh;
      }

      // Adjust for last line
      if (lineNum === endLine) {
        lineEndCh = endCh;
      }

      // Only create highlight if there's actually something selected on this line
      if (lineEndCh > lineStartCh) {
        highlights.push({
          top: (lineNum - 1) * 19 + 20,
          left: lineStartCh * 8.5 + 60,
          width: (lineEndCh - lineStartCh) * 8.5,
          height: 19,
        });
      }
    }

    return highlights;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Connection Status and Participants */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-300">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Participants:</span>
          <div className="flex space-x-1">
            {participants.map((participant) => (
              <div
                key={participant._id}
                className={`w-6 h-6 rounded-full ${getParticipantColor(
                  participant._id
                )} flex items-center justify-center text-xs text-white cursor-pointer relative group`}
                title={participant.name}
              >
                {participant.name.charAt(0).toUpperCase()}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  {participant.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button
          text={isRunning ? "Running..." : "Run Code"}
          onClick={runCode}
          disabled={isRunning}
        />
      </div>

      {/* CodeMirror Editor */}
      <div className="flex-1 relative">
        <CodeMirror
          value={docValue}
          height="100%"
          theme="dark"
          extensions={extensions}
          onChange={handleCodeChange}
          onUpdate={(viewUpdate) => {
            // Always track cursor position, not just when document changes
            if (viewUpdate.selectionSet || viewUpdate.docChanged) {
              handleCursorChange(viewUpdate.view);
            }
            if (viewUpdate.selectionSet) {
              handleSelectionChange(viewUpdate.view);
            }
          }}
          basicSetup={{
            ...basicSetup,
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLineGutter: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />

        {/* Live Cursors Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {cursors.map((cursor, index) => {
            const position = getCursorPosition(cursor.line, cursor.ch);
            return (
              <div
                key={`${cursor.user._id}-${index}`}
                className="absolute"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  zIndex: 1000,
                }}
              >
                {/* Cursor line - thinner with glow effect */}
                <div
                  className={`w-0.5 h-5 ${getParticipantBorderColor(
                    cursor.user._id
                  )} bg-current opacity-90 ${getParticipantGlowColor(
                    cursor.user._id
                  )} shadow-lg`}
                ></div>

                {/* User avatar - positioned at top right */}
                <div
                  className={`absolute -top-9 -right-0.5 w-4 h-4 rounded-full ${getParticipantColor(
                    cursor.user._id
                  )} flex items-center justify-center text-[12px] text-white relative group cursor-pointer shadow-lg border-1 border-white`}
                >
                  {cursor.user.name.charAt(0).toUpperCase()}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                    {cursor.user.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection Highlights Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {selections.map((selection, index) => {
            const highlights = getSelectionPosition(
              selection.from,
              selection.to
            );
            return highlights.map((highlight, highlightIndex) => (
              <div
                key={`selection-${selection.user._id}-${index}-${highlightIndex}`}
                className={`absolute ${getParticipantBgColor(
                  selection.user._id
                )} rounded-sm`}
                style={{
                  top: `${highlight.top}px`,
                  left: `${highlight.left}px`,
                  width: `${highlight.width}px`,
                  height: `${highlight.height}px`,
                }}
              ></div>
            ));
          })}
        </div>
      </div>

      {/* Console Output */}
      {consoleOutput.length > 0 && (
        <div className="h-32 bg-gray-900 border-t border-gray-700 p-2 overflow-y-auto">
          <div className="text-sm text-gray-300 font-mono">
            {consoleOutput.map((output, index) => (
              <div key={index} className="mb-1">
                <span className="text-green-400">{">"}</span> {output}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
