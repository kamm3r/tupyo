// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlTableCreator,
  timestamp,
  varchar,
  json,
  int,
  unique,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `nonex_${name}`);

export const pollQuestion = mysqlTable(
  "poll-question",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    endsAt: timestamp("ends_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    question: varchar("question", { length: 5000 }),
    ownerToken: varchar("owner-token", { length: 255 }),
    options: json("options"),
    vote: vote,
  },
  index("owner-token"),
);

export const vote = mysqlTable(
  "vote",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    choice: int("choice"),
    voteToken: varchar("vote-token", { length: 255 }),

    question: pollQuestion,
    questionId: varchar("question-id", { length: 255 }),
  },
  unique(["vote-token", "question-id"]),
  index("vote-token"),
  index("question-id"),
);
