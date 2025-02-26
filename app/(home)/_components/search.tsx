import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { SearchIcon } from "lucide-react";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface SearchProps {
  setDataSearch: (data: any) => void;
}

const Search = ({ setDataSearch }: SearchProps) => {
  const { data } = useSession();
  const [fileName, setFileName] = useState("");
  const api = process.env.NEXT_PUBLIC_API_URL;

  const handleRequest = async (
    endpoint: string,
    method = "GET",
    body: FormData | object | null = null
  ) => {
    try {
      const headers: { Authorization: string; "Content-Type"?: string } = {
        Authorization: `Bearer ${data?.user?.idToken || ""}`,
      };

      const options: RequestInit = { method, headers };
      if (body) options.body = body instanceof FormData ? body : JSON.stringify(body);

      const response = await fetch(`${api}${endpoint}`, options);
      const result = await response.json();
      if (result.arquivos.length === 0) {
        toast.info("Nenhum arquivo encontrado!");
      }
      setDataSearch(result.arquivos);
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Procurar arquivo..."
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <Button
        variant="default"
        size="icon"
        onClick={() => {
          const query = fileName.trim() !== "" ? fileName : "all";
          handleRequest(`/searchPublicFiles/${query}`);
        }}
      >
        <SearchIcon size={18} />
      </Button>
    </div>
  );
};

export default Search;
