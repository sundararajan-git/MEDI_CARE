import PatientDashboard from "@/features/dashboard/components/patient/PatientDashboard";
import { MedicationProvider } from "@/providers/MedicationContext";

const PatientPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) => {
  const { date } = await searchParams;

  return (
    <MedicationProvider>
      <div className="flex flex-col items-center w-full h-full p-8 gap-8">
        <div className="w-full sm:max-w-6xl">
          <PatientDashboard selectedDate={date} />
        </div>
      </div>
    </MedicationProvider>
  );
};

export default PatientPage;
