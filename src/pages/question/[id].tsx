import { Vote } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/@/components/ui/button";
import { Progress } from "~/@/components/ui/progress";
import { api } from "~/utils/api";

type OptionType = {
  text: string;
};

const QuestionsPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data } = api.questions.getById.useQuery({ id });
  let totalVotes = 0;

  const { mutate, data: voteResponse } =
    api.questions.voteOnQuestion.useMutation({
      onSuccess: () => {
        voteResponse?.map((choice: { _count: number }) => {
          totalVotes += choice._count;
        });
        window.location.reload();
      },
    });

  if (!data?.question) {
    return <div>Question not found</div>;
  }
  // TODO: fix any type in getTotalVotes
  function getTotalVotes(votes: any): void {
    votes?.map((choice) => {
      totalVotes += choice._count;
    });
  }

  function getPercent(voteCount: number | undefined): number {
    if (voteCount !== undefined && totalVotes > 0) {
      return (voteCount / totalVotes) * 100;
    } else if (voteCount == undefined) {
      return 0;
    } else {
      return 0;
    }
  }

  if (data && data != undefined) getTotalVotes(data.votes);

  return (
    <div className="container min-h-screen w-screen p-6">
      <Head>
        <title>Question | Tupyo</title>
      </Head>
      <header className="mb-10 flex w-full items-center justify-between">
        <Link href={"/"}>
          <h1 className="cursor-pointer text-4xl font-bold">Tupyo</h1>
        </Link>
        {data?.isOwner && <div className="rounded-md p-3">You made this!</div>}
      </header>

      <main className="mx-auto max-w-2xl">
        <h1 className="mb-10 text-center text-2xl font-bold">
          {data?.question?.question}
        </h1>

        <div className="flex flex-col gap-4">
          {(data?.question?.options as string[])?.map((option, index) => {
            if (data?.isOwner || data?.vote) {
              return (
                <div key={index}>
                  <div className="flex justify-between">
                    <p className="font-bold">
                      {(option as unknown as OptionType).text}
                    </p>
                    <p>
                      {getPercent(data?.votes?.[index]?._count)?.toFixed()}%
                    </p>
                  </div>
                  <Progress value={getPercent(data?.votes?.[index]?._count)} />
                </div>
              );
            }

            return (
              <Button
                onClick={() =>
                  mutate({ questionId: data.question!.id, option: index })
                }
                key={index}
                variant="outline"
              >
                {(option as unknown as OptionType).text}
              </Button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const QuestionPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID</div>;
  }

  return <QuestionsPageContent id={id} />;
};

export default QuestionPage;
