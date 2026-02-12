import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { RateLimiterPrisma } from "rate-limiter-flexible";

const FREE_POINTS = 5;
const PRO_POINTS = 50;
const DURATION = 30 * 24 * 60 * 60; // 30 days
const GENERATE_COST = 1;

const freeUsageLimiter = new RateLimiterPrisma({
  storeClient: prisma,
  tableName: "usage",
  points: FREE_POINTS,
  duration: DURATION,
});

const proUsageLimiter = new RateLimiterPrisma({
  storeClient: prisma,
  tableName: "usage",
  points: PRO_POINTS,
  duration: DURATION,
});

export async function getUsageTracker() {
  const { has } = await auth();

  const hasProAccess = has({ plan: "pro_user" });

  return hasProAccess ? proUsageLimiter : freeUsageLimiter;
}

export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const usage = await getUsageTracker();
  try {
    const result = await usage.consume(userId, GENERATE_COST);
    return result;
  } catch (err) {
    throw new Error(
      "You have reached your free usage limit. Please upgrade to continue using the service.",
    );
  }
}

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const usage = await getUsageTracker();
  const points = await usage.get(userId);

  return (
    points ?? {
      remainingPoints: usage.points,
      consumedPoints: 0,
      msBeforeNext: DURATION * 1000, // Full duration in milliseconds for new users
    }
  );
}
