// src/components/ChallengeCard.tsx

import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock as ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "@/pages/style/Challenges.module.css";
import { Challenge } from "@/components/ChallengePopup"; // or wherever your type lives

interface ChallengeCardProps {
    challenge: Challenge;
    onJoin: (id: number) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin }) => {
    const {
        id,
        title,
        description,
        image,
        startDate,
        startTime,
        endDate,
        participants,
        type,
        meeting_url,
        isParticipating,
    } = challenge;

    return (
        <Card className={styles.challengeCard}>
            <div className={styles.cardImageContainer}>
                <img src={image} alt={title} className={styles.cardImage} />
            </div>

            <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>{title}</CardTitle>
                <Badge variant="secondary">{type}</Badge>
            </CardHeader>

            <CardContent className={styles.cardContent}>
                <p className={styles.cardDescription}>{description}</p>
                <div className={styles.cardMeta}>
                    <div className="flex items-center">
                        <Calendar className={`${styles.metaIcon} ${styles.metaIconBlue} mr-1`} />
                        <span>{startDate} – {endDate}</span>
                    </div>
                    {startTime && (
                        <div className="flex items-center">
                            <ClockIcon className={`${styles.metaIcon} ${styles.metaIconBlue} mr-1`} />
                            <span>{startTime.slice(0, 5)}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <Users className={`${styles.metaIcon} ${styles.metaIconGreen} mr-1`} />
                        <span>{participants} participants</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className={`flex justify-between items-center ${styles.cardFooter}`}>
                <div className="flex gap-2">
                    {isParticipating ? (
                        <Button disabled>You Are In</Button>
                    ) : (
                        <Button onClick={() => onJoin(id)}>Join Challenge</Button>
                    )}

                    {meeting_url && (
                        <Button
                            onClick={() => window.open(meeting_url, "_blank")}
                        >
                            Join Video Call
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default ChallengeCard;
