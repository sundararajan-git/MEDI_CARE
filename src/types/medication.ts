export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  reminder_time: string;
  created_at: string;
  deleted_at: string | null;
  status?: "taken" | "missed" | "pending" | "upcoming";
  evidenceUrl?: string;
  isReadOnly?: boolean;
}

export interface HistoryEntry {
  date: string;
  status: "future" | "empty" | "complete" | "partial" | "missed";
  taken: number;
  total: number;
  hasTaken: boolean;
  hasMissed: boolean;
}

export interface ActivityEntry {
  id: string;
  medication_id: string;
  date: string;
  time: string;
  status: "taken" | "missed" | "pending";
  medication: string;
  type: "log" | "reminder" | "notification";
  evidenceUrl?: string;
}

export interface PatientStats {
  streak: number;
  todayStatus: number;
  monthlyRate: number;
  totalMeds: number;
  takenCount: number;
  missedThisMonth: number;
  takenThisWeek: number;
  remainingDays: number;
  history: HistoryEntry[];
  recentActivity: ActivityEntry[];
  email: string;
}
