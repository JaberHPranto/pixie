import { caller } from "@/trpc/server";

export default async function Home() {
  const data = await caller.hello({ text: "SERVER world" });

  return <div className="text-rose-500 text-3xl">{data.greeting}</div>;
}
