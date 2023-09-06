import { Database, Stars } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Textarea } from "../../components/ui/textarea";
import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/button";
import { OpenAI } from "openai";
import gsap from "gsap";
import { Input } from "../../components/ui/input";
import { Toaster } from "../../components/ui/toaster";
import { useToast } from "../../components/ui/use-toast.ts";

function GenerateSql() {
  const [schemas, setSchemas] = useState<string>(localStorage.getItem("schemas") ?? "");
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent) {
    const api = new OpenAI({
      apiKey: key ?? import.meta.env.VITE_OPENAI_KEY ?? "",
      dangerouslyAllowBrowser: true,
    });
    e.preventDefault();
    setLoading(true);
    const responseApi = await api.chat.completions
      .create({
        messages: [
          {
            role: "user",
            content: `
      Com base nos schemas sql abaixo, retorne uma sql de consulta com base no prompt informado abaixo também,
       retorne SOMENTE o sql, nada além disso

      schemas: '''${schemas}'''
      prompt: ${prompt}
      `,
          },
        ],
        model: "gpt-3.5-turbo-16k",
      })
      .catch((err) => {
        if (err.status === 401) {
          toast({
            title: "Api key unothorized",
            description: "Verify your api key and try again.",
          });
        }

        toast({
          title: "Ops, something is wrong.",
          description: "Verify yours inputs or try later.",
        });
        setLoading(false);
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setResponse((responseApi as any).choices[0].message.content ?? "");
    setLoading(false);
  }

  document.onmousemove = (e) => {
    const { clientX, clientY } = e;
    const blob = document.getElementById("blob");
    if (blob) {
      blob.animate(
        {
          top: `${clientY}px`,
          left: `${clientX}px`,
        },
        { fill: "forwards", duration: 600 }
      );
    }
  };

  document.onmousedown = (e) => {
    const { clientX, clientY } = e;
    const el = document.createElement("div");
    el.style.borderRadius = "50%";
    // el.style.background = "red"
    el.style.height = "2px";
    el.style.width = "2px";
    el.style.position = "fixed";
    el.style.translate = "-50% -50%";
    el.style.zIndex = "999";
    el.style.pointerEvents = "none";
    el.style.border = "0px solid #22222222";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);

    el.style.top = `${clientY}px`;
    el.style.left = `${clientX}px`;

    gsap.to(el, {
      width: 30,
      height: 30,
      ease: "power0",
      border: "4px solid #22222222",
      duration: 0.2,
      onComplete: () => {
        gsap.to(el, {
          width: 55,
          height: 55,
          duration: 0.6,
          border: "0px solid transparent",
          opacity: 0,
          onComplete: () => el.remove(),
        });
      },
    });
  };

  return (
    <div className="w-full flex justify-center items-center h-screen select-none flex-col">
      <Toaster />
      <div
        id="blob"
        className="h-80 aspect-square fixed rounded-full bg-blue-700/10 blur-3xl -translate-x-1/2 -translate-y-1/2"
      />

      <Input
        placeholder="Your OPENAI key"
        className="z-10 mb-4 max-w-xl "
        value={key}
        onChange={(evt) => setKey(evt.target.value)}
      />
      <div className="relative w-full max-w-xl border bg-white/50 backdrop-blur-3xl z-10 rounded-xl shadow-2xl shadow-black/10">
        <header className="w-full h-16 flex justify-between px-10 items-center shadow-sm border-b">
          <span className="flex gap-2 items-center justify-center">
            <Database />
            <span className="text-2xl">GenerateSql</span>
          </span>
          <Stars />
        </header>

        <main className="p-4">
          <form onSubmit={handleSubmit}>
            <h3>Schemas:</h3>
            <div className="relative flex border rounded-lg">
              <Textarea
                value={schemas}
                onChange={(e) => {
                  setSchemas(e.target.value);
                  localStorage.setItem("schemas", e.target.value);
                }}
              />
            </div>

            <h3 className="mt-4 mb-1">Prompt:</h3>
            <Textarea onChange={(e) => setPrompt(e.target.value)} value={prompt} />
            <Button type="submit" className="w-full my-2 flex gap-2">
              <Stars /> {loading ? "Carregando..." : "GenerateSQL"}
            </Button>
          </form>
          <h3 className="mt-4">Result:</h3>

          <div className="rounded-lg overflow-hidden select-text">
            <SyntaxHighlighter language="SQL" showInlineLineNumbers={true} style={atomOneLight}>
              {response}
            </SyntaxHighlighter>
          </div>
        </main>
      </div>
    </div>
  );
}

export default GenerateSql;
