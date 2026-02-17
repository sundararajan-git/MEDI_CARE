import CaretakerDashboard from "@/features/dashboard/components/caretaker/CaretakerDashboard";
import { MedicationProvider } from "@/providers/MedicationContext";

const CaretakerPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) => {
  const { date } = await searchParams;

  return (
    <MedicationProvider>
      <div className="flex flex-col items-center p-8 gap-8">
        <div className="w-full max-w-6xl">
          <CaretakerDashboard selectedDate={date} />
        </div>
      </div>
    </MedicationProvider>
  );
};

export default CaretakerPage;
