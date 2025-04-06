
import { BookOpenCheck } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <BookOpenCheck className="h-8 w-8 text-edu-primary" />
      <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-edu-primary to-edu-secondary bg-clip-text text-transparent">
        EduHub
      </span>
    </div>
  );
};

export default Logo;
