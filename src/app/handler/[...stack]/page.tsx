import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack/server";
import { Suspense } from "react";

export default function Handler(props: unknown) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </Suspense>
  );
}
