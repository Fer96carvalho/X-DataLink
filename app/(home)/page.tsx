"use client";

import Header from "../_components/header";
import FileItem from "./_components/fileItem";
import { useEffect, useState } from "react";
import Search from "./_components/search";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FilePlus2, FolderHeartIcon, FolderSearch, LucideFolderSync } from "lucide-react";
import { Button } from "../_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../_components/ui/dialog";
import { Label } from "../_components/ui/label";
import { Input } from "../_components/ui/input";
import { toast } from "sonner";

export default function Home() {
  const [dataSearch, setDataSearch] = useState<any[]>([]);
  const [userSession, setUserSession] = useState<any>(null);
  const [userID, setUserID] = useState<string>("");
  const [fileUser, setFileUser] = useState<any[]>([]);
  const [sharewithMe, setSharewithMe] = useState<any[]>([]);
  const { data } = useSession();
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [dialogUpload, setDialogUpload] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL;


  async function createUser(user: any) {
    if (userID !== "") return;

    try {
      const response = await fetch(`${api}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken ?? ""}`,
        },
        body: JSON.stringify({ user }),
      });

      if (!response.ok) {
        console.error("Erro na criação do usuário:", response);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API", error);
    }
  }

  async function getFiles(userToken: string) {
    try {
      const response = await fetch(`${api}/userFiles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const files = await response.json();
        setFileUser(files.data);
        setUserID(files.userID);
      } else {
        console.error("Erro ao buscar arquivos:", response);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API de arquivos", error);
    }
  }

  async function shareFiles(userToken: string) {
    try {
      const response = await fetch(`${api}/sharedFiles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const files = await response.json();
        setSharewithMe(files);
      } else {
        console.error("Erro ao buscar arquivos:", response);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API de arquivos", error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      setUserSession(data);
      if (data) {
        await createUser(data.user);
        await getFiles(data.user?.idToken);
        await shareFiles(data.user?.idToken);
      }
    }

    fetchData();
  }, [data]);

  if (!userSession) {
    return (
      <div>
        <Header />
        <div className="w-full h-[calc(100vh-151px)] flex flex-col gap-8 pt-20 pb-16 items-center">
          <Image src="/dataink.png" alt="x-datalink" height={66} width={260} />
          <h2 className="text-xl font-bold text-primary">
            Bem vindo ao X-DataLink!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-145px)]">
      <Header />
      <div className="px-40 py-5 flex justify-between items-center border-b border-solid border-primary">
        <div className="flex">
          <h2 className="text-xl font-bold flex row pr-1">
            Olá,
          </h2>
          <p className="text-primary text-xl font-bold">{userSession.user.name ?? ""}</p>
        </div>
        <div className=" flex gap-4 items-center justify-center ">
          <Dialog open={dialogUpload} onOpenChange={setDialogUpload}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 min-w-[80px]"
                variant="secondary"
                size="icon"
              >
                <FilePlus2 className="text-primary" size={24} />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload de arquivo</DialogTitle>
                <DialogDescription>
                  Selecione o arquivo que voce deseja enviar.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="file" className="sr-only">
                    Arquivo
                  </Label>
                  <Input
                    type="file"
                    id="file"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.files) {
                        setFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="px-3"
                  onClick={async () => {
                    const formData = new FormData();
                    if (fileUpload) {
                      formData.set("file", fileUpload);
                      const result = await fetch(
                        `${api}/uploadData`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${userSession.user.idToken}`,
                          },
                          body: formData,
                        }
                      );
                      console.log(result);
                      if (result.ok) {
                        setDialogUpload(false);
                        toast.success(
                          `Sucesso: Seu arquivo ${fileUpload.name} foi enviado!`
                        );
                      } else {
                        toast.error(
                          `Error: "Ocorreu um erro ao enviar seu arquivo, tente novamente!"}`,
                          {}
                        );
                      }
                    }
                  }}
                >
                  <span className=" text-white">Enviar</span>
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Fechar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Search setDataSearch={setDataSearch} />
        </div>

      </div>
      {dataSearch && dataSearch.length > 0 && (
        <div className="mt-0 py-8 px-40 border-b border-solid border-primary">
          <h2 className="text-md px-5 flex gap-2 mb-3 uppercase text-gray-400 font-bold"><FolderSearch size={24} className="text-primary"></FolderSearch>
            {dataSearch.length > 0
              ? "Arquivos publicos encontrados"
              : "Nenhum arquivo encontrado"}
          </h2>
          <div className="flex flex-wrap px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {dataSearch.map((item) => (
              <FileItem
                key={item.id}
                item={item}
                token={userSession.user.idToken}
                id={userID}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-0 py-8 px-40 border-b border-solid border-primary">
        <h2 className="text-md px-5 flex gap-2 mb-3 uppercase text-gray-400 font-bold"><FolderHeartIcon size={24} className="text-primary"></FolderHeartIcon>
          {fileUser.length > 0
            ? "Meus arquivos"
            : "Voce ainda nao possui arquivos"}
        </h2>
        <div className="flex flex-wrap px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden ">
          {fileUser.length > 0 &&
            fileUser.map((file) => (
              <FileItem
                key={file.id}
                item={file}
                token={userSession.user.idToken}
                id={userID}
              />
            ))}
        </div>
      </div>

      <div className="mt-0 py-8 px-40 border-b border-solid border-primary">
        <h2 className="text-md px-5 flex gap-2 mb-3 uppercase text-gray-400 font-bold"><LucideFolderSync size={24} className="text-primary"></LucideFolderSync>
          {sharewithMe.length > 0
            ? "Arquivos compartilhados com você"
            : "Nenhum arquivo compartilhado com você"}
        </h2>
        <div className="flex flex-wrap px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {sharewithMe.length > 0 &&
            sharewithMe.map((file) => (
              <FileItem
                key={file.id}
                item={file}
                token={userSession.user.idToken}
                id={userID}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
