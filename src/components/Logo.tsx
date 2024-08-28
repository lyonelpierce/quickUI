import { ZapIcon } from "lucide-react";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex gap-1 items-center">
      <div className="bg-slate-950 dark:bg-slate-50 rounded-lg p-1.5">
        <ZapIcon className="size-5 text-background animate-pulse transition-all ease-in-out duration-500" />
      </div>
      <h1 className="font-medium text-xl">
        Quick
        <span className="font-semibold">UI</span>
      </h1>
    </Link>
  );
};

export default Logo;
