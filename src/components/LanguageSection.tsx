import { Card, CardContent } from "@/components/ui/card";
import { Languages, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const phrases = [
  {
    english: "Hello",
    ilocano: "Kumusta",
    itneg: "Kumusta ka"
  },
  {
    english: "Thank you",
    ilocano: "Agyamanak",
    itneg: "Agyamanak"
  },
  {
    english: "How are you?",
    ilocano: "Kumusta kan?",
    itneg: "Kumusta ka?"
  },
  {
    english: "Welcome",
    ilocano: "Naragsak nga isasangbay",
    itneg: "Malipayon nga pag-abot"
  },
  {
    english: "Goodbye",
    ilocano: "Agpakadaakon",
    itneg: "Asta pay ti meting"
  },
  {
    english: "Beautiful",
    ilocano: "Napintas",
    itneg: "Napintas"
  }
];

const LanguageSection = () => {
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
            Master basic Ilocano and Itneg phrases to connect authentically with Abra's warm communities
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

                {/* Itneg */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-primary uppercase tracking-wider">
                      Itneg
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-base font-medium text-foreground">
                    {phrase.itneg}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default LanguageSection;
