import { AspectRatio } from "@/components/ui/aspect-ratio";

// Replace this with your actual YouTube video ID (just the ID, not the full URL)
const YOUTUBE_VIDEO_ID = "HbFJKWzD9-0";

const VideoSection = () => {
  const embedUrl = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=1&rel=0&modestbranding=1`;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Experience Abra</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the beauty, culture, and adventure that awaits you in the heart of the Cordillera
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-elegant border border-border/50">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={embedUrl}
              title="Discover Abra - YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
