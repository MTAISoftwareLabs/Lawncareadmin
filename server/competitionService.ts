import type { Request, Response } from "express";
import { and, asc, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { db } from "./db";
import { competitions, competitionEntries, users, votes } from "../shared/schema";

type AuthRequest = Request & { userId?: number };

export async function findActiveCompetition(now = new Date()) {
  const [active] = await db
    .select()
    .from(competitions)
    .where(
      and(
        eq(competitions.isActive, true),
        lte(competitions.startDate, now),
        gte(competitions.endDate, now),
      ),
    )
    .orderBy(desc(competitions.startDate))
    .limit(1);

  if (active) return active;

  const [upcoming] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.isActive, true))
    .orderBy(asc(competitions.startDate))
    .limit(1);

  return upcoming ?? null;
}

export async function getUserVotedEntryIds(userId?: number): Promise<number[]> {
  if (!userId) return [];
  const rows = await db
    .select({ entryId: votes.entryId })
    .from(votes)
    .where(eq(votes.userId, userId));
  return rows.map((row) => row.entryId);
}

export function formatCompetitionEntry(
  entry: typeof competitionEntries.$inferSelect,
  user: { id: number; name: string; avatar: string | null } | null,
  hasVoted: boolean,
) {
  const voteCount = entry.votes ?? 0;
  return {
    id: entry.id,
    competitionId: entry.competitionId,
    userId: entry.userId,
    title: entry.title,
    description: entry.description,
    imageUrl: entry.imageUrl,
    beforeImageUrl: entry.beforeImageUrl,
    votes: voteCount,
    voteCount,
    hasVoted,
    isVotedByMe: hasVoted,
    is_liked_by_me: hasVoted,
    is_voted_by_me: hasVoted,
    status: entry.status,
    createdAt: entry.createdAt,
    user: user
      ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          location: null,
        }
      : null,
  };
}

export async function listCompetitionEntries(competitionId: number, userId?: number) {
  const votedEntryIds = await getUserVotedEntryIds(userId);

  const rows = await db
    .select({
      entry: competitionEntries,
      user: { id: users.id, name: users.name, avatar: users.avatar },
    })
    .from(competitionEntries)
    .leftJoin(users, eq(competitionEntries.userId, users.id))
    .where(
      and(
        eq(competitionEntries.competitionId, competitionId),
        eq(competitionEntries.status, "approved"),
      ),
    )
    .orderBy(desc(competitionEntries.votes));

  return rows.map((row) =>
    formatCompetitionEntry(row.entry, row.user, votedEntryIds.includes(row.entry.id)),
  );
}

export async function listPastWinners(limit = 6) {
  const pastContests = await db
    .select()
    .from(competitions)
    .where(eq(competitions.status, "completed"))
    .orderBy(desc(competitions.endDate))
    .limit(limit);

  const winners = await Promise.all(
    pastContests.map(async (contest) => {
      const [winnerEntry] = await db
        .select({
          entry: competitionEntries,
          user: { id: users.id, name: users.name, avatar: users.avatar, email: users.email },
        })
        .from(competitionEntries)
        .leftJoin(users, eq(competitionEntries.userId, users.id))
        .where(
          and(
            eq(competitionEntries.competitionId, contest.id),
            or(eq(competitionEntries.isWinner, true), eq(competitionEntries.rank, 1)),
          ),
        )
        .limit(1);

      if (!winnerEntry) return null;

      return {
        id: contest.id,
        competition_id: contest.id,
        competitionId: contest.id,
        competition_title: contest.title,
        competitionTitle: contest.title,
        month: contest.month,
        year: contest.year ? String(contest.year) : null,
        start_date: contest.startDate,
        end_date: contest.endDate,
        prize: contest.prize,
        prize_image_url: contest.prizeImageUrl,
        entry_title: winnerEntry.entry.title,
        entry_image: winnerEntry.entry.imageUrl,
        imageUrl: winnerEntry.entry.imageUrl,
        entry_description: winnerEntry.entry.description,
        userName: winnerEntry.user?.name || "Anonymous",
        winner: {
          id: winnerEntry.user?.id,
          name: winnerEntry.user?.name || "Anonymous",
          avatar: winnerEntry.user?.avatar,
        },
      };
    }),
  );

  return winners.filter((winner): winner is NonNullable<typeof winner> => winner !== null);
}

export async function toggleEntryVote(userId: number, entryId: number) {
  const [existingVote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.entryId, entryId)));

  if (existingVote) {
    await db.delete(votes).where(and(eq(votes.userId, userId), eq(votes.entryId, entryId)));
    const [entry] = await db
      .update(competitionEntries)
      .set({ votes: sql`GREATEST(${competitionEntries.votes} - 1, 0)` })
      .where(eq(competitionEntries.id, entryId))
      .returning();

    return {
      success: true,
      action: "unvoted" as const,
      voted: false,
      votes: entry?.votes ?? 0,
      message: "Vote removed",
    };
  }

  await db.insert(votes).values({ userId, entryId });
  const [entry] = await db
    .update(competitionEntries)
    .set({ votes: sql`${competitionEntries.votes} + 1` })
    .where(eq(competitionEntries.id, entryId))
    .returning();

  return {
    success: true,
    action: "voted" as const,
    voted: true,
    votes: entry?.votes ?? 0,
    message: "Vote added",
  };
}

export async function submitCompetitionEntry(
  userId: number,
  input: {
    title?: string;
    description?: string;
    imageUrl?: string;
    beforeImageUrl?: string;
    competitionId?: number;
  },
) {
  const { title, description, imageUrl, beforeImageUrl, competitionId } = input;

  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  let competition;
  if (competitionId) {
    [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, competitionId))
      .limit(1);
  } else {
    competition = await findActiveCompetition();
  }

  if (!competition) {
    throw new Error("No active competition found");
  }

  if (competition.status !== "active" && competition.status !== "upcoming") {
    throw new Error(`Competition is ${competition.status}, entries are not accepted`);
  }

  const [existingEntry] = await db
    .select()
    .from(competitionEntries)
    .where(
      and(
        eq(competitionEntries.competitionId, competition.id),
        eq(competitionEntries.userId, userId),
      ),
    )
    .limit(1);

  if (existingEntry) {
    throw new Error("You have already submitted an entry for this competition");
  }

  const [entry] = await db
    .insert(competitionEntries)
    .values({
      competitionId: competition.id,
      userId,
      title,
      description,
      imageUrl,
      beforeImageUrl,
      status: "approved",
    })
    .returning();

  return { competition, entry };
}

export function sendWinnersResponse(res: Response, winners: Awaited<ReturnType<typeof listPastWinners>>) {
  res.json({ winners, data: winners });
}

export function sendEntriesResponse(
  res: Response,
  entries: Awaited<ReturnType<typeof listCompetitionEntries>>,
  page = 1,
) {
  res.json({
    status: true,
    entries,
    data: entries,
    page,
  });
}

export async function handleActiveEntries(req: AuthRequest, res: Response) {
  try {
    const active = await findActiveCompetition();
    if (!active) {
      return sendEntriesResponse(res, []);
    }

    const entries = await listCompetitionEntries(active.id, req.userId);
    sendEntriesResponse(res, entries);
  } catch (error) {
    console.error("Error fetching active competition entries:", error);
    res.status(500).json({ status: false, error: "Failed to fetch entries" });
  }
}

export async function handleCompetitionEntries(req: AuthRequest, res: Response) {
  try {
    const competitionId = parseInt(req.params.id, 10);
    const page = parseInt((req.query.page as string) || "1", 10);
    const entries = await listCompetitionEntries(competitionId, req.userId);
    sendEntriesResponse(res, entries, page);
  } catch (error) {
    console.error("Error getting competition entries:", error);
    res.status(500).json({ status: false, error: "Failed to get entries" });
  }
}

export async function handleSubmitActiveEntry(req: AuthRequest, res: Response) {
  try {
    const imageUrl = req.body.imageUrl || req.body.image_url;
    const result = await submitCompetitionEntry(req.userId!, {
      title: req.body.title,
      description: req.body.description || req.body.caption,
      imageUrl,
      beforeImageUrl: req.body.beforeImageUrl || req.body.before_image_url,
    });

    res.json({
      status: true,
      success: true,
      message: "Entry submitted successfully",
      data: result.entry,
    });
  } catch (error: any) {
    const message = error.message || "Failed to submit entry";
    const statusCode =
      message.includes("No active competition") ? 404 :
      message.includes("already submitted") ? 400 :
      message.includes("Image URL") ? 400 :
      500;
    res.status(statusCode).json({ status: false, success: false, error: message });
  }
}

export async function handleSubmitCompetitionEntry(req: AuthRequest, res: Response) {
  try {
    const competitionId = parseInt(req.params.id, 10);
    const result = await submitCompetitionEntry(req.userId!, {
      competitionId,
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      beforeImageUrl: req.body.beforeImageUrl,
    });

    res.json({
      status: true,
      message: "Entry submitted successfully",
      data: result.entry,
    });
  } catch (error: any) {
    const message = error.message || "Failed to submit entry";
    const statusCode = message.includes("not found") ? 404 : message.includes("already submitted") ? 400 : 500;
    res.status(statusCode).json({ status: false, error: message });
  }
}

export async function handleToggleVote(req: AuthRequest, res: Response) {
  try {
    const entryId = parseInt(req.params.id, 10);
    const result = await toggleEntryVote(req.userId!, entryId);
    res.json(result);
  } catch (error) {
    console.error("Error toggling vote:", error);
    res.status(500).json({ success: false, error: "Failed to toggle vote" });
  }
}

export async function handleWinners(_req: Request, res: Response) {
  try {
    const winners = await listPastWinners();
    sendWinnersResponse(res, winners);
  } catch (error) {
    console.error("Error fetching winners:", error);
    res.status(500).json({ success: false, error: "Failed to fetch winners" });
  }
}

export async function handleContestInfo(_req: Request, res: Response) {
  try {
    const active = await findActiveCompetition();
    if (!active) {
      return res.json({ contest_id: null, contest_title: null });
    }

    res.json({
      contest_id: `monthly_${active.id}`,
      id: active.id,
      contest_title: active.title,
      title: active.title,
      description: active.description,
      rules: active.rules,
      rules_summary: active.rules || active.description,
      banner_image: active.image,
      prize_details: active.prize,
      prize: active.prize,
      prizeImageUrl: active.prizeImageUrl,
      start_date: active.startDate,
      startDate: active.startDate,
      end_date: active.endDate,
      endDate: active.endDate,
      status: active.status,
      isActive: active.isActive,
    });
  } catch (error) {
    console.error("Error fetching contest info:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contest info" });
  }
}
