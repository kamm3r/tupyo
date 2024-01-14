import React from "react";
import { api } from "~/utils/api";

import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/@/components/ui/form";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import { Trash2Icon } from "lucide-react";

const createQuestionValidator = z.object({
  question: z.string().min(5).max(600),
  options: z
    .array(z.object({ text: z.string().min(1).max(200) }))
    .min(2)
    .max(20),
});

const CreateQuestionForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof createQuestionValidator>>({
    resolver: zodResolver(createQuestionValidator),
    defaultValues: {
      options: [{ text: "Yes" }, { text: "No" }],
    },
  });

  const { fields, append, remove } = useFieldArray<
    z.infer<typeof createQuestionValidator>
  >({
    name: "options", // unique name for your Field Array,
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
  });

  const { mutate, isLoading, data } = api.questions.create.useMutation({
    onSuccess: async (data) => {
      await router.push(`/question/${data.id}`);
    },
  });

  if (isLoading || data)
    return (
      <div className="flex min-h-screen items-center justify-center antialiased">
        <p className="">Loading...</p>
      </div>
    );

  function onSubmit(data: z.infer<typeof createQuestionValidator>) {
    mutate(data);
  }

  return (
    <div className="min-h-screen p-6 antialiased">
      <Head>
        <title>Create | Tupyo</title>
      </Head>
      <header className="header flex w-full justify-between">
        <Link href={"/"}>
          <h1 className="cursor-pointer text-4xl font-bold">Tupyo</h1>
        </Link>
      </header>
      <div className="mx-auto max-w-xl py-12 md:max-w-2xl">
        <h2 className="text-2xl font-bold">Create a new poll</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex w-full flex-col gap-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Input placeholder="How do magnets work?" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ul className="grid w-full grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
                {fields.map((field, index) => (
                  <li key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => append({ text: "Another Option" })}
                >
                  Add options
                </Button>
              </div>
              <div className=" w-full">
                <Button type="submit" className="w-full">
                  Create question
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

const QuestionCreator: React.FC = () => {
  return <CreateQuestionForm />;
};

export default QuestionCreator;
