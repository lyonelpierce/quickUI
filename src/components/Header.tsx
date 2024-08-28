import Logo from "./Logo";

import { SignInButton, UserButton } from "@clerk/nextjs";

import ModeToggle from "./ModeToggle";
import { auth } from "@clerk/nextjs/server";

const Header = async () => {
  const userId = auth().userId;

  return (
    <div className="fixed w-screen flex items-center justify-between h-16 border-b px-8 z-10 bg-background">
      <Logo />
      <div className="flex gap-4 items-center">
        <ModeToggle />
        {!userId ? <SignInButton /> : <UserButton />}
      </div>
    </div>
  );
};

export default Header;
