// src/components/ChallengePopup.tsx
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, X } from "lucide-react";

export interface Challenge {
    id: number;
    title: string;
    description: string;
    image: string;
    startDate: string;       // e.g. "2025-05-01"
    endDate: string;         // e.g. "2025-05-31"
    participants: number;
    type: string;
    meeting_url?: string;    // e.g. "https://zoom.us/..."
}

interface ChallengePopupProps {
    challenge: Challenge;
    trigger: React.ReactNode;
}

const ChallengePopup: React.FC<ChallengePopupProps> = ({ challenge, trigger }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="max-w-md w-full">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl">{challenge.title}</DialogTitle>
                    </div>
                    <Badge variant="secondary">{challenge.type}</Badge>
                </DialogHeader>

                <div className="mt-4">
                    <img
                        src={challenge.image}
                        alt={challenge.title}
                        className="w-full h-48 object-cover rounded-md"
                    />
                </div>

                <div className="mt-4 space-y-4">
                    <p className="text-gray-700">{challenge.description}</p>

                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1 text-plank-blue" />
                        <span>
                            {challenge.startDate} – {challenge.endDate}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1 text-plank-green" />
                        <span>{challenge.participants} participants</span>
                    </div>

                    {challenge.meeting_url && (
                        <div className="mt-2">
                            <a
                                href={challenge.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-plank-blue font-medium hover:underline"
                            >
                                Join meeting
                            </a>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <DialogClose asChild>
                        <Button variant="ghost">Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChallengePopup;
