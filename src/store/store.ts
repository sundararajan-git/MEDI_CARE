import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import medicationReducer from "./features/medicationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    medication: medicationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
