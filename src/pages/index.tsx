import Head from "next/head";
import Link from "next/link";
import React from "react";
// import QuestionCard from "../components/QuestionCard";
import { api } from "../utils/api";
import { type PollQuestion } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/@/components/ui/card";
import { CopyIcon } from "lucide-react";
import { Button } from "~/@/components/ui/button";
import { ModeToggle } from "~/components/themeToggle";

function QuestionCard({
  question,
  copyToClipboard,
}: {
  question: PollQuestion;
  copyToClipboard: (question: PollQuestion) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle key={question.id} className="card-title">
          {question.question}
        </CardTitle>
        <CardDescription>
          Created on {question.createdAt.toDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/question/${question.id}`}>View</Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(question)}
        >
          <CopyIcon />
          {/* <CopyCheckIcon /> */}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [showToast, setShowToast] = React.useState(false);
  const { data, isLoading } = api.questions.getAllQuestions.useQuery();

  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;

  const copyToClipboard = (question: PollQuestion) => {
    void navigator.clipboard.writeText(`${url}/question/${question.id}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center antialiased">
        <p className="text-white/40">Loading...</p>
      </div>
    );

  return (
    <div className="relative min-h-screen w-screen items-stretch p-6">
      <Head>
        <title>Home | Tupyo</title>
      </Head>
      <header className="header flex w-full items-center justify-between">
        <h1 className="text-4xl font-bold">Tupyo</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/create" className="rounded p-4">
              Create Poll
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </header>
      <main className="mt-10 grid grid-cols-1 gap-y-5 md:grid-cols-4 md:gap-x-5">
        {data?.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            copyToClipboard={copyToClipboard}
          />
        ))}
      </main>

      {/* Toast that will show at the bottom-right of the screen */}
      {showToast && (
        <div className="absolute bottom-5 right-10 flex w-1/5 items-center justify-center rounded-md bg-slate-50/10 p-3">
          <span className="text-xs font-semibold">
            Link Copied to Clipboard!
          </span>
        </div>
      )}
    </div>
  );
}
