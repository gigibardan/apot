import { useState } from "react";
import { Copy, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ContentGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string) => void;
  context?: {
    title?: string;
    country?: string;
    continent?: string;
    topic?: string;
  };
}

export function ContentGeneratorModal({
  open,
  onOpenChange,
  onInsert,
  context = {}
}: ContentGeneratorModalProps) {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState("");

  const getPrompt = (type: string): string => {
    const { title, country, continent, topic } = context;

    const prompts: Record<string, string> = {
      description: `Scrie o descriere captivantă de 300-500 cuvinte despre ${title || "[Titlu]"} din ${country || "[Țară]"}.

Include:
- Istoric și semnificație
- Ce face locul special
- Când să vizitezi (best season)
- Sfaturi practice pentru vizitatori
- Informații utile

Stil: Informativ dar captivant, pentru călători curioși.
Ton: Profesional dar prietenos, în limba română.`,

      excerpt: `Creează un excerpt de maxim 150 caractere pentru ${title || "[Titlu]"}.

Trebuie să fie:
- Captivant și concis
- Include elementul unic/special al locului
- Atragă atenția cititorului

Limbă: Română`,

      metaDescription: `Scrie o meta description SEO-optimized de maxim 160 caractere pentru ${title || "[Titlu]"}.

Include:
- Keyword principal: ${title || "[Titlu]"}
- Locație: ${country || "[Țară]"}
- Call to action implicit

Format: Fără ghilimele, direct textul.`,

      blogTitle: `Generează 10 titluri captivante pentru un articol blog despre ${topic || title || "[Topic]"}.

Stiluri diferite:
- How-to: "Cum să..."
- Listicle: "Top 10..."
- Ghid: "Ghid complet..."
- Personal: "De ce merită..."

Limbă: Română
Lungime: Max 60 caractere per titlu`
    };

    return prompts[type] || "";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiat!",
      description: "Prompt-ul a fost copiat în clipboard."
    });
  };

  const handleInsert = () => {
    if (generatedContent.trim()) {
      onInsert(generatedContent);
      onOpenChange(false);
      toast({
        title: "Conținut inserat",
        description: "Textul generat a fost adăugat în formular."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generator de Conținut AI
          </DialogTitle>
          <DialogDescription>
            Folosește template-urile de prompt pentru a genera conținut de calitate cu ChatGPT sau Claude
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="description" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Descriere</TabsTrigger>
            <TabsTrigger value="excerpt">Excerpt</TabsTrigger>
            <TabsTrigger value="metaDescription">Meta SEO</TabsTrigger>
            <TabsTrigger value="blogTitle">Titlu Blog</TabsTrigger>
          </TabsList>

          {["description", "excerpt", "metaDescription", "blogTitle"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Prompt Template</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(getPrompt(type))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiază Prompt
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {getPrompt(type)}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Pași:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copiază prompt-ul de mai sus</li>
                  <li>Deschide ChatGPT sau Claude</li>
                  <li>Lipește prompt-ul și trimite</li>
                  <li>Copiază răspunsul generat</li>
                  <li>Lipește-l mai jos și apasă "Inserează în Formular"</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conținut Generat</label>
                <Textarea
                  placeholder="Lipește aici textul generat de AI..."
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleInsert} 
                disabled={!generatedContent.trim()}
                className="w-full"
              >
                Inserează în Formular
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
