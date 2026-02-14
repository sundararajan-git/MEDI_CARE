"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { increment, decrement } from "@/store/features/counterSlice";
import { Button } from "@/components/ui/button";

const SupabaseTestClient = () => {
  const counter = useSelector((state: RootState) => state.counter);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded">
      <p className="font-heading text-2xl font-bold mb-4">
        Counter: {counter.value}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => dispatch(increment())}
          className="font-heading font-semibold"
        >
          + Increment
        </Button>
        <Button
          onClick={() => dispatch(decrement())}
          variant="outline"
          className="font-heading font-semibold"
        >
          - Decrement
        </Button>
      </div>
    </div>
  );
};

export default SupabaseTestClient;
