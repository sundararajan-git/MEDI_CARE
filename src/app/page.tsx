import { redirect } from "next/navigation";

const HomePage = async () => {
  redirect("/patient");
};

export default HomePage;
