import { cn } from "@/lib/utils";

const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full mx-auto h-full", className)}>{children}</div>
  );
};

export default Wrapper;
