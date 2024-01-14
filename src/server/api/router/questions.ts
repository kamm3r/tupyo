// import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const createQuestionValidator = z.object({
  question: z.string().min(5).max(600),
  options: z
    .array(z.object({ text: z.string().min(1).max(200) }))
    .min(2)
    .max(20),
});

export const questionRouter = createTRPCRouter({
  getAllQuestions: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.token) {
      return [];
    }
    return await ctx.db.pollQuestion.findMany({
      where: {
        ownerToken: {
          equals: ctx.token,
        },
      },
    });
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const question = await ctx.db.pollQuestion.findFirst({
        where: {
          id: input.id,
        },
      });

      const myVote = await ctx.db.vote.findFirst({
        where: {
          questionId: input.id,
          voterToken: ctx.token,
        },
      });

      const rest = {
        question,
        vote: myVote,
        isOwner: question?.ownerToken === ctx.token,
      };

      if (rest.vote ?? rest.isOwner) {
        const votes = await ctx.db.vote.groupBy({
          where: { questionId: input.id },
          by: ["choice"],
          _count: true,
        });

        return {
          ...rest,
          votes,
        };
      }

      return { ...rest, votes: undefined };
    }),
  voteOnQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
        option: z.number().min(0).max(10),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.token) {
        throw new Error("Unauthroized");
      }
      await ctx.db.vote.create({
        data: {
          questionId: input.questionId,
          choice: input.option,
          voterToken: ctx.token,
        },
      });

      return await ctx.db.vote.groupBy({
        where: { questionId: input.questionId },
        by: ["choice"],
        _count: true,
      });
    }),
  create: publicProcedure
    .input(createQuestionValidator)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.token) {
        throw new Error("Unauthroized");
      }
      return await ctx.db.pollQuestion.create({
        data: {
          question: input.question,
          options: input.options,
          ownerToken: ctx.token,
        },
      });
    }),
});
