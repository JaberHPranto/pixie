import { Button } from "@/components/ui/button";
import { PRO_POINTS_THRESHOLD } from "@/utils/constants";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  points: number;
  msBeforeNext: number;
}

export const UsageTracker = ({ points, msBeforeNext }: Props) => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro_user" });

  if (hasProAccess && points > PRO_POINTS_THRESHOLD) return null;

  return (
    <div className="rounded-t-xl bg-background border border-b-0 p-2.5 pl-4">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProAccess ? "" : "free"} credits remaining
          </p>
          <p className="text-xs text-muted-foreground">
            Resets in{" "}
            {formatDuration(
              intervalToDuration({
                start: new Date(),
                end: new Date(Date.now() + msBeforeNext),
              }),
              { format: ["months", "days", "hours"] },
            )}
          </p>
        </div>

        {!hasProAccess && (
          <Button asChild size={"sm"} variant={"tertiary"} className="ml-auto">
            <Link href={"/pricing"}>
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
