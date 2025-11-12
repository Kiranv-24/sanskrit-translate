import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TranslatedWordProps {
  word: string;
  sourceLang: string;
  targetLang: string;
}

const TranslatedWord = ({ word, sourceLang, targetLang }: TranslatedWordProps) => {
  const [translation, setTranslation] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (translation || isLoading) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: {
          word,
          sourceLang,
          targetLang,
        }
      });

      if (!error && data?.code === 200 && data?.data?.translatedText) {
        setTranslation(data.data.translatedText);
      }
    } catch (error) {
      console.error('Word translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span
      className="relative inline-block cursor-pointer transition-all duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={`px-1 py-0.5 rounded transition-all duration-200 ${
          isHovered ? "bg-primary/20 text-primary-foreground" : "hover:bg-muted"
        }`}
      >
        {word}
      </span>
      
      {isHovered && (translation || isLoading) && (
        <span
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 bg-popover border border-border rounded-md shadow-lg text-sm text-popover-foreground whitespace-nowrap z-10 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : (
            translation
          )}
          <span className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
        </span>
      )}
    </span>
  );
};

export default TranslatedWord;
