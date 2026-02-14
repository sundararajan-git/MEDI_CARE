"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { decrement, increment } from "@/store/features/counterSlice";
import { AppDispatch, RootState } from "@/store/store";
import { createClient } from "@/lib/supabase/server";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabase/client";

const page = () => {
  const counter = useSelector((state: RootState) => state.counter);
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("users").select();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <h1 className="font-heading">Welcome to our World</h1>
      <h1 className="font-sans">Welcome to our World</h1>
      <ThemeToggle />
      <p>{counter.value}</p>
      <Button
        onClick={() => {
          dispatch(increment());
        }}
      >
        Increment
      </Button>
      <Button
        onClick={() => {
          dispatch(decrement());
        }}
      >
        Decrement
      </Button>
    </div>
  );
};
export default page;
