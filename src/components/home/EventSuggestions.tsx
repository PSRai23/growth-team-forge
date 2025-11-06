import { Card } from "@/components/ui/card";
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    id: 1,
    title: "Wedding Next Week",
    date: "Dec 15, 2025",
    suggestions: 3,
    color: "bg-accent/10 border-accent/30",
  },
  {
    id: 2,
    title: "Business Meeting",
    date: "Dec 12, 2025",
    suggestions: 5,
    color: "bg-primary/10 border-primary/30",
  },
];

export function EventSuggestions() {
  return (
    <section className="mb-8 px-4">
      <h3 className="text-lg font-serif font-semibold text-primary mb-4">
        Upcoming Events
      </h3>
      
      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className={`p-4 border ${event.color} cursor-pointer hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-ui">
                    {event.date}
                  </span>
                </div>
                <h4 className="font-medium text-primary mb-1">
                  {event.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {event.suggestions} outfit suggestions ready
                </p>
              </div>
              
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
