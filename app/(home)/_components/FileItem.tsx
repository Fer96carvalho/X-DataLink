"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { FileDown, Lock, Unlock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { dataHoraFormat } from "@/app/_lib/hours";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

interface ItemProps {
  item: any;
  token: string;
  id?: string;
}

const FileItem = ({ item, token, id }: ItemProps) => {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPrivate, setIsPrivate] = useState(item.privado);

  const handleDonwload = async () => {
    const linkFile = await fetch(`${api}/download/${item.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (linkFile.ok) {
      const download = await linkFile.json();
      window.open(download.downloadUrl, "_blank");
    } else {
      console.error("Erro ao buscar arquivos:", linkFile);
    }
  };

  function formatFileSize(bytes) {
    const KB = 1024;
    const MB = KB * 1024;

    if (bytes < MB) {
      return `${(bytes / KB).toFixed(2)} KB`;
    } else {
      return `${(bytes / MB).toFixed(2)} MB`;
    }
  }

  function FileOptionsDialog(file: any) {
    const handleDelete = async () => {
      try {
        const response = await fetch(
          `${api}/delete/${file.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setDialogOpen(false);
          toast.success("Arquivo excluído com sucesso.");
        }
      } catch (error) {
        toast.error(`Erro: ${error.message}`);
      }
    };

    const handleTogglePrivacy = async () => {
      try {
        const response = await fetch(
          `${api}/changePrivacy/${file.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setDialogOpen(false);
          setIsPrivate(!isPrivate);
          toast.success(
            `Arquivo agora é ${isPrivate ? "público" : "privado"}.`
          );
        }
      } catch (error) {
        toast.error(`Erro: ${error.message}`);
      }
    };

    const handleCopyFile = async () => {
      try {
        const response = await fetch(
          `${api}/copyFile/${file.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao copiar arquivo");
        }else{
          toast.success("Arquivo copiado com sucesso!");
          setDialogOpen(false);
        }
      } catch (error) {
        toast.error(`Erro: ${error.message}`);
      }
    };

    const handleShare = async () => {
      try {
        const response = await fetch(`${api}/shareFile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fileID: item.id, userEmail: email }),
        });

        if (!response.ok) throw new Error("Erro ao compartilhar o arquivo");
        if (response.ok) {
          setDialogOpen(false);
        }

        toast.success(`Arquivo compartilhado com ${email} com sucesso!`);
        setEmail("");
      } catch (error) {
        toast.error(`Erro: ${error.message}`);
      }
    };

    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button className="flex mx-6 py-1 justify-center items-center rounded-xl border border-solid border-primary hover:bg-secondary">
            <FileDown size={46} className=" text-primary" />
            {file?.Arquivos ? (
              <p>{file.Arquivos.nome?.split(".").pop()}</p>
            ) : file ? (
              <p>{file.nome.split(".").pop()}</p>
            ) : null}
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Opções do Arquivo</DialogTitle>
            <DialogDescription>
              Selecione uma das opções abaixo para o arquivo &quot;
              {file?.Arquivos ? (
                <p>{file.Arquivos.nome}</p>
              ) : file ? (
                <p>{file.nome}</p>
              ) : null}
              &quot;.
            </DialogDescription>
          </DialogHeader>
          {id && id !== file.proprietarioID && (
            <Button
              variant="outline"
              onClick={handleCopyFile}
              className="w-full bg-blue-500 hover:bg-blue-400"
            >
              Copiar para meus arquivos
            </Button>
          )}
          {id && id === file.proprietarioID && (
            <div className="grid gap-4 py-4">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="w-full"
              >
                Excluir Arquivo
              </Button>
              <Button
                onClick={handleTogglePrivacy}
                className={`w-full ${isPrivate ? "bg-green-500" : "bg-gray-500"}`}
              >
                {isPrivate ? "Tornar Público" : "Tornar Privado"}
              </Button>

              <div className="mt-4">
                <Label htmlFor="email" className="block">
                  Compartilhar com outro usuário
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o e-mail"
                  className="mt-2"
                />
                <Button
                  onClick={handleShare}
                  disabled={!email}
                  className="w-full mt-2"
                >
                  Compartilhar
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="min-w-[170px] max-w-[170px] rounded-2xl">
      <CardContent className="px-1 py-0 h-[250px] flex flex-col align-center justify-around">
        <div className="w-full relative">
          <div className=" left-2 z-50">
            <Badge
              variant="secondary"
              className="flex gap-2 items-center justify-center top-3 left-3 opacity-90"
            >
              <span className="text-xs">{dataHoraFormat(item.criadoEm)}</span>
              {item.privado ? (
                <Lock size={18} className="fill-red-500" />
              ) : (
                <Unlock size={18} className="fill-green-500" />
              )}
            </Badge>
          </div>
        </div>
        {FileOptionsDialog(item)}

        <div className="px-2">
          {item.Arquivos?.Usuarios ? (
            <div className="flex items-center gap-1 mb-2">
            <User size={14} className="fill-primary" />
            <p className="text-sm text-primary ">
              {item.Arquivos.Usuarios.nome}
            </p>
            </div>
          ) : null}
          {item.Usuarios? (
            <div className="flex items-center gap-1 mb-2">
            <User size={14} className="fill-primary" />
            <p className="text-sm text-primary ">
              {item.Usuarios.nome}
            </p>
            </div>
          ):null}

          <h2 className="font-bold text-sm text-ellipsis overflow-hidden whitespace-nowrap">
            {item?.Arquivos ? (
              <p>{item.Arquivos.nome?.split(".")[0]}</p>
            ) : item ? (
              <p>{item.nome.split(".")[0]}</p>
            ) : null}

            {item.Arquivos?.tamanho ? (
              <p className="text-xs">
                Size: {formatFileSize(item.Arquivos.tamanho)}
              </p>
            ) : (
              <p className="text-xs">Size: {formatFileSize(item?.tamanho)}</p>
            )}
          </h2>

          <Button
            variant="secondary"
            className="w-full mt-3 hover:text-primary"
            onClick={handleDonwload}
          >
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileItem;
