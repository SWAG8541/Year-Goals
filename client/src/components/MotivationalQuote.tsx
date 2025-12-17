import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
];

export function MotivationalQuote() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('dailyQuote');
    const savedDate = localStorage.getItem('dailyQuoteDate');

    if (saved && savedDate === today) {
      setQuote(saved);
    } else {
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(newQuote);
      localStorage.setItem('dailyQuote', newQuote);
      localStorage.setItem('dailyQuoteDate', today);
    }
  }, []);

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Quote className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium text-foreground italic">"{quote}"</p>
            <p className="text-xs text-muted-foreground mt-2">Daily Motivation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
