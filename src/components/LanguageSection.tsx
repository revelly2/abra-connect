import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Languages, Volume2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const phrases = [
  {
    english: "Hello",
    ilocano: "Kumusta",
  },
  {
    english: "Thank you",
    ilocano: "Agyamanak",
  },
  {
    english: "How are you?",
    ilocano: "Kumusta kan?",
  },
  {
    english: "Welcome",
    ilocano: "Naragsak nga isasangbay",
  },
  {
    english: "Goodbye",
    ilocano: "Agpakadaakon",
  },
  {
    english: "Beautiful",
    ilocano: "Napintas",
  }
];

const LanguageSection = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<"English" | "Tagalog">("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Please enter text",
        description: "Enter some text to translate to Ilocano",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");

    try {
      const { data, error } = await supabase.functions.invoke("translate-ilocano", {
        body: { text: inputText, sourceLanguage },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setTranslatedText(data.translation);
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 text-sm mb-4">
            <Languages className="w-4 h-4 text-primary" />
            <span className="text-foreground">Connect with Locals</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Learn <span className="text-transparent bg-clip-text bg-gradient-accent">Local Phrases</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master basic Ilocano phrases to connect authentically with Abra's warm communities
          </p>
        </div>

        {/* Language Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {phrases.map((phrase, index) => (
            <Card 
              key={index}
              className="group bg-card border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 space-y-4">
                {/* English */}
                <div className="pb-3 border-b border-border">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    English
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {phrase.english}
                  </div>
                </div>

                {/* Ilocano */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-primary uppercase tracking-wider">
                      Ilocano
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-base font-medium text-foreground">
                    {phrase.ilocano}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Translator Section */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Translate to Ilocano
              </h3>
              <p className="text-muted-foreground">
                Translate English or Tagalog text to Ilocano using AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={sourceLanguage} onValueChange={(v) => setSourceLanguage(v as "English" | "Tagalog")}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Tagalog">Tagalog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder={`Enter ${sourceLanguage} text...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Output Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 text-sm font-medium text-primary">
                    Ilocano
                  </div>
                </div>
                <div className="min-h-[120px] p-3 rounded-md border border-border bg-muted/30 text-foreground">
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Translating...
                    </div>
                  ) : translatedText ? (
                    translatedText
                  ) : (
                    <span className="text-muted-foreground">Translation will appear here...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !inputText.trim()}
                variant="hero"
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    Translate
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </section>
  );
};

export default LanguageSection;
