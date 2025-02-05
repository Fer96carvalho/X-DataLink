import { ptBR } from "date-fns/locale/pt-BR";
import Header from "../_components/header";
import { format } from "date-fns";
//import Search from "./_components/search";
//import BarbershopItem from "./_components/barbershop-item";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default async function Home() {



  return (
    <div>
      <Header />
      <div className="px-5 pt-5">
        <h2 className="text-xl font-bold">Olá, Fernando!</h2>
        <p className="capitalize text-sm">
          {format(new Date(), "EEE ',' dd 'de' MMMM", {
            locale: ptBR,
          })}
        </p>
      </div>
      <div className="px-5 mt-6">{/* <Search/> */}</div>
      {/* <div className="px-5 mt-6">
        <h2 className="text-xs mb-3 uppercase text-gray-400 font-bold">Agendamentos</h2>
        <Item />
      </div> */}
      <div className="mt-6">
        <h2 className="text-xs px-5 mb-3 uppercase text-gray-400 font-bold">
          Recomendados
        </h2>
        <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {/* {barbershops.map((barbershop)=>(
            <BarbershopItem key={barbershop.id} barbershop={barbershop}/>
        ))} */}
        </div>
      </div>
      <div className="mt-6 mb-[4.5rem]">
        <h2 className="text-xs px-5 mb-3 uppercase text-gray-400 font-bold">
          Populares
        </h2>
        <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {/* {barbershops.map((barbershop)=>(
            <BarbershopItem key={barbershop.id} barbershop={barbershop}/>
        ))} */}
        </div>
      </div>
    </div>
  );
}
