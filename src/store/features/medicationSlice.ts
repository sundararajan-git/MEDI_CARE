import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getMedications } from "@/features/medications/actions";
import { getPatientStats } from "@/features/dashboard/actions";
import { Medication, PatientStats } from "@/types/medication";

interface MedicationState {
  medications: Medication[];
  stats: PatientStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  selectedDate: string | null;
}

const initialState: MedicationState = {
  medications: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  selectedDate: null,
};

export const fetchMedications = createAsyncThunk(
  "medications/fetchMedications",
  async (dateStr: string | undefined, { rejectWithValue }) => {
    try {
      const result = await getMedications(dateStr);
      if (result.error) {
        return rejectWithValue(result.error);
      }
      return result.data as Medication[];
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch medications";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchStats = createAsyncThunk(
  "medications/fetchStats",
  async (dateStr: string | undefined, { rejectWithValue }) => {
    try {
      const result = await getPatientStats(dateStr);
      if ("error" in result && result.error) {
        return rejectWithValue(result.error);
      }
      return result as PatientStats;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch stats";
      return rejectWithValue(errorMessage);
    }
  },
);

const medicationSlice = createSlice({
  name: "medication",
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    clearMedications: (state) => {
      state.medications = [];
      state.stats = null;
      state.error = null;
      state.loading = false;
      state.statsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedications.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.medications = []; // Clear previous data to avoid showing stale cache
      })
      .addCase(
        fetchMedications.fulfilled,
        (state, action: PayloadAction<Medication[]>) => {
          state.loading = false;
          state.medications = action.payload;
        },
      )
      .addCase(fetchMedications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(
        fetchStats.fulfilled,
        (state, action: PayloadAction<PatientStats>) => {
          state.statsLoading = false;
          state.stats = action.payload;
        },
      )
      .addCase(fetchStats.rejected, (state, action) => {
        state.statsLoading = false;
        console.error("Stats fetch failed:", action.payload);
      });
  },
});

export const { setSelectedDate, clearMedications } = medicationSlice.actions;
export default medicationSlice.reducer;
