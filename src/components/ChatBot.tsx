import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot,
  TestTube, // Fixed: Using TestTube instead of Flask
  HelpCircle,
  Lightbulb
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const chemistryFAQs = [
  {
    question: "What happens when acid and base mix?",
    answer: "When you mix an acid and a base, they undergo a neutralization reaction. The pH moves toward 7 (neutral), and you'll often see color changes and gas bubbles forming. This is because H⁺ ions from the acid react with OH⁻ ions from the base to form water."
  },
  {
    question: "Why does the solution change color?",
    answer: "Color changes occur due to chemical indicators or the formation of new compounds. In acid-base reactions, different pH levels cause indicator molecules to change their structure, which affects how they absorb light and appear to our eyes."
  },
  {
    question: "What causes bubbling in reactions?",
    answer: "Bubbling indicates gas evolution! This happens when a chemical reaction produces a gas as a product. In acid-base reactions, CO₂ gas is often produced, creating the bubbles you see."
  },
  {
    question: "Why does heating change the reaction?",
    answer: "Heat increases molecular motion and collision frequency, making reactions happen faster. At 100°C, water boils and you'll see vigorous bubbling from the phase change from liquid to gas."
  },
  {
    question: "How do I safely handle chemicals?",
    answer: "Always add acid to water (never water to acid), wear safety equipment, work in a well-ventilated area, and never mix unknown chemicals. The lab shows safety warnings when pH or temperature reach dangerous levels."
  }
];

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your chemistry lab assistant. I can help you understand reactions, safety procedures, and what's happening in your experiments. Ask me anything!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simple bot response logic
    setTimeout(() => {
      const botResponse = getBotResponse(input.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    // Check for common chemistry keywords
    if (input.includes('acid') && input.includes('base')) {
      return chemistryFAQs[0].answer;
    }
    if (input.includes('color') || input.includes('change')) {
      return chemistryFAQs[1].answer;
    }
    if (input.includes('bubble') || input.includes('gas')) {
      return chemistryFAQs[2].answer;
    }
    if (input.includes('heat') || input.includes('temperature') || input.includes('boil')) {
      return chemistryFAQs[3].answer;
    }
    if (input.includes('safe') || input.includes('danger')) {
      return chemistryFAQs[4].answer;
    }
    if (input.includes('ph')) {
      return "pH measures how acidic or basic a solution is. pH 7 is neutral, below 7 is acidic, and above 7 is basic. The scale goes from 0 (very acidic) to 14 (very basic).";
    }
    if (input.includes('neutralization')) {
      return "Neutralization occurs when an acid and base react to form water and a salt. The reaction tends to produce a pH closer to 7, and often generates heat and gas bubbles.";
    }

    // Default responses
    const defaultResponses = [
      "That's an interesting chemistry question! Try experimenting with different combinations in the lab to see what happens.",
      "I'd love to help you explore that concept. Have you tried mixing acids and bases to observe the neutralization reaction?",
      "Chemistry is all about observing and understanding reactions. What specific part of the experiment would you like to know more about?",
      "Great question! Remember to always observe safety guidelines when experimenting. What would you like to learn about next?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleQuickQuestion = (faq: typeof chemistryFAQs[0]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: faq.question,
      isBot: false,
      timestamp: new Date()
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: faq.answer,
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lab hover:shadow-glow-blue transition-all duration-300 z-50 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        size="lg"
      >
        <TestTube className="w-6 h-6" />
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] bg-card/95 backdrop-blur-sm border-border/50 shadow-lab z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Chemistry Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isBot
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Quick Questions:</span>
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {chemistryFAQs.slice(0, 2).map((faq, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(faq)}
                  className="text-xs h-auto p-2 justify-start text-left whitespace-normal"
                >
                  <HelpCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                  {faq.question}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about chemistry..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};