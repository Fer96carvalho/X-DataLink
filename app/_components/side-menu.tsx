"use client";

import { SheetHeader, SheetTitle } from "./ui/sheet";
import {
  LogInIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

const SideMenu = () => {
  const api = process.env.API_URL;
  const { data } = useSession();

  const handleLoginClick = async () => {
    const result = await signIn("google", { redirect: false, prompt: 'select_account'});
  };
  
  const handleLogoutClick = async() => {
    const data = await fetch(`${api}/logout`, {
    })
    signOut();

  }

  return (
    <>
      <SheetHeader className="text-left border-b border-solid border-secondary p-5">
        <SheetTitle>Menu</SheetTitle>
      </SheetHeader>
      {data?.user ? (
        <div className="flex justify-between px-5 py-6 items-center">
          <div className="flex items-center gap-3 ">
            <Avatar>
              <AvatarImage src={`${data.user.image}`} />
            </Avatar>
            <h2 className="font-bold">{data.user.name}</h2>
          </div>
          <div className="w-fit">

          <Button variant="secondary" size="icon">
            <LogOutIcon onClick={handleLogoutClick} />
          </Button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 ">
            <UserIcon size={32} />
            <h2 className="font-bold">Olá, faça seu login!</h2>
          </div>
          <div className="w-fit">
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={handleLoginClick}
            >
            <LogInIcon className="mr-2" size={18} />
            Fazer Login
          </Button>
            </div>
        </div>
      )}
      {/* <div className="flex flex-col gap-2 px-5 w-fit">
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/">
            <HomeIcon size={18} className="mr-2" />
            Início
          </Link>
        </Button>
      </div> */}
    </>
  );
};

export default SideMenu;
