"use client";

import { Share2 } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

export default function ShareLinkButton({ code }: { code?: string }) {
    const handleShareLeaderboard = () => {
        const shareUrl = `${window.location.origin}/challenge/${code}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!', {
            description: 'Share this leaderboard with your friends',
        });
    };
    return (
        <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleShareLeaderboard}
        >
            <Share2 className="size-4" />
            Share
        </Button>
    )

}