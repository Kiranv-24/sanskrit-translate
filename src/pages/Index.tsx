import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TranslatedWord from "@/components/TranslatedWord";

const targetLanguages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
];

const Index = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          text: sourceText,
          sourceLang: 'sa',
          targetLang,
        }
      });

      if (error) throw error;

      if (data?.code === 200 && data?.data?.translatedText) {
        setTranslatedText(data.data.translatedText);
        toast.success("Translation completed!");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error("Translation failed");
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate. Please check your API key configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const words = sourceText.split(/\s+/).filter(word => word.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sanskrit Multi-Language Translator
          </h1>
          <p className="text-muted-foreground">Translate Sanskrit texts with hover word translation</p>
        </div>

        <Card className="p-6 mb-6 backdrop-blur-sm bg-card/95 shadow-lg border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Source Language
              </label>
              <Select value="sa" disabled>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Sanskrit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sa">Sanskrit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Language
              </label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter Sanskrit Text
              </label>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type or paste Sanskrit text here..."
                className="min-h-[150px] resize-none bg-background border-border focus:border-primary"
              />
              
              {sourceText && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Hover over words for instant translation:</p>
                  <div className="flex flex-wrap gap-2">
                    {words.map((word, index) => (
                      <TranslatedWord
                        key={`${word}-${index}`}
                        word={word}
                        sourceLang="sa"
                        targetLang={targetLang}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleTranslate}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </Button>

            {translatedText && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Translation
                </label>
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
