import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Session } from "@supabase/supabase-js";

interface UserState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  session: null,
  loading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User | null; session: Session | null }>,
    ) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, clearUser } = userSlice.actions;

export const selectDisplayName = (state: { user: UserState }) => {
  const user = state.user.user;
  if (!user) return "User";

  const email = user.email;
  const metadataName =
    user.user_metadata?.full_name || user.user_metadata?.name;

  if (metadataName) return metadataName;

  if (email) {
    return email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return "User";
};

export default userSlice.reducer;
