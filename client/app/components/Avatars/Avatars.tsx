import React from "react";
import Avatar from "./Avatar";

interface AvatarsProps {
  participants: UserProfile[];
  visibleCount?: number;
}

const Avatars = ({ participants, visibleCount = 2 }: AvatarsProps) => {
  const visibleParticipants = participants.slice(0, visibleCount);
  const extraParticipants = participants.slice(visibleCount);

  return (
    <div className="flex items-center mt-4 relative">
      {visibleParticipants.map((participant, index) => (
        <Avatar
          key={participant._id || index}
          imagePath={participant.avatar}
          alt={participant.name}
        />
      ))}

      {extraParticipants.length > 0 && (
        <div className="relative group">
          <span className="ml-2 text-sm text-gray-300 cursor-pointer">
            +{extraParticipants.length} participants
          </span>
          <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg p-3 z-10 hidden group-hover:block">
            {participants.map((participant, index) => (
              <div
                key={participant._id || index}
                className="flex items-center space-x-2 py-1"
              >
                <Avatar imagePath={participant.avatar} alt={participant.name} />
                <span className="text-sm text-gray-700">
                  {participant.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatars;
