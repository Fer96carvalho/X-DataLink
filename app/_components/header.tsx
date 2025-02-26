"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import SideMenu from "./side-menu";


const Header = () => {

    return ( 
        <Card>
            <CardContent className="p-5 justify-between items-center flex flex-row">
                <Image src="/dataink.png" alt="x-datalink" height={22} width={120} />
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant={"outline"} size={"icon"}>
                            <MenuIcon size={18}/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="p-0">
                        <SideMenu />
                    </SheetContent>
                </Sheet>
            </CardContent>
        </Card>
     );
}
 
export default Header;
