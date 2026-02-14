import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const page = () => {
  return (
    <div>
      <h1 className="font-heading">Welcome to our World</h1>
      <h1 className="font-sans">Welcome to our World</h1>
      <ThemeToggle />
      <Button>Click Me</Button>
    </div>
  );
};
export default page;
