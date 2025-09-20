import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Bot, 
  Send, 
  X, 
  Lightbulb, 
  HelpCircle, 
  TestTube, 
  Brain,
  Loader2,
  Zap
} from 'lucide-react';

// Check if API key is available - prioritize GitHub Secrets in production
const getApiKey = () => {
  // In production (GitHub Pages), use the injected environment variable from GitHub Secrets
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // In development, use local .env file
  return import.meta.env.VITE_GEMINI_API_KEY;
};

const GEMINI_API_KEY = getApiKey();
const isApiKeyConfigured = GEMINI_API_KEY && 
  GEMINI_API_KEY !== 'your-gemini-api-key-here' && 
  GEMINI_API_KEY !== 'your_actual_api_key_here' &&
  GEMINI_API_KEY !== 'AIzaSyAJQ8tTvi-aoJ1GpcCzcGdF_zsveqWUm2w'; // Exclude example key

// Debug API key status (only in development)
if (import.meta.env.DEV) {
  console.log('🔑 API Key Status:', GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
  console.log('🔑 API Key Length:', GEMINI_API_KEY ? GEMINI_API_KEY.length + ' characters' : 'N/A');
  console.log('🔑 Environment:', import.meta.env.PROD ? 'Production (GitHub)' : 'Development (Local)');
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'normal' | 'suggestion' | 'warning' | 'success';
}

interface ChatBotProps {
  currentExperiment?: any;
  reactionState?: any;
}

// Enhanced chemistry knowledge base with contextual suggestions
const chemistryFAQs = [
  {
    question: "What happens when acid and base mix?",
    answer: "When you mix an acid and a base, they undergo a neutralization reaction. The pH moves toward 7 (neutral), and you'll often see color changes and gas bubbles forming. This is because H⁺ ions from the acid react with OH⁻ ions from the base to form water.",
    context: ['acid-base', 'neutralization'],
    difficulty: 'beginner'
  },
  {
    question: "Why does the solution change color?",
    answer: "Color changes occur due to chemical indicators or the formation of new compounds. In acid-base reactions, different pH levels cause indicator molecules to change their structure, which affects how they absorb light and appear to our eyes.",
    context: ['indicators', 'pH', 'color'],
    difficulty: 'intermediate'
  },
  {
    question: "What causes bubbling in reactions?",
    answer: "Bubbling indicates gas evolution! This happens when a chemical reaction produces a gas as a product. In acid-base reactions, CO₂ gas is often produced, creating the bubbles you see.",
    context: ['gas-evolution', 'bubbles'],
    difficulty: 'beginner'
  },
  {
    question: "Why does heating affect reaction rate?",
    answer: "Heat increases molecular motion and collision frequency, making reactions happen faster. Higher temperatures provide more energy for molecules to overcome activation barriers and react more readily.",
    context: ['temperature', 'kinetics'],
    difficulty: 'intermediate'
  },
  {
    question: "How do I safely handle chemicals?",
    answer: "Always add acid to water (never water to acid), wear safety equipment, work in a well-ventilated area, and never mix unknown chemicals. The lab shows safety warnings when pH or temperature reach dangerous levels.",
    context: ['safety', 'handling'],
    difficulty: 'beginner'
  },
  {
    question: "What is pH and how is it measured?",
    answer: "pH measures hydrogen ion concentration on a scale of 0-14. Values below 7 are acidic, 7 is neutral, and above 7 is basic. pH meters and indicators help us measure these values accurately.",
    context: ['pH', 'measurement'],
    difficulty: 'beginner'
  },
  {
    question: "How do catalysts work?",
    answer: "Catalysts speed up reactions by providing an alternative pathway with lower activation energy. They participate in the reaction but are regenerated unchanged, so they're not consumed in the process.",
    context: ['catalysis', 'kinetics'],
    difficulty: 'advanced'
  }
];

const ChatBot = ({ currentExperiment, reactionState }: ChatBotProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: isApiKeyConfigured 
        ? `🧪 Hello! I'm Dr. ChemBot, your AI chemistry assistant powered by Gemini AI. I can help you understand chemical reactions, explain experimental results, and answer your chemistry questions!`
        : `🧪 Hello! I'm Dr. ChemBot. Note: AI features are currently offline (API key not configured). I'll still help with basic chemistry questions using my knowledge base!`,
      isBot: true,
      timestamp: new Date(),
      type: isApiKeyConfigured ? 'success' : 'warning'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  // Test API connectivity when chat opens
  useEffect(() => {
    if (isOpen && isApiKeyConfigured) {
      // Quietly test API connectivity
      const testAPI = async () => {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Test" }] }],
              generationConfig: { maxOutputTokens: 10 }
            })
          });
          
          if (response.ok) {
            console.log('✅ API Key is working! Gemini AI is ready.');
          } else {
            console.warn('⚠️ API Key might be invalid. Status:', response.status);
          }
        } catch (error) {
          console.warn('⚠️ Could not verify API connectivity:', error);
        }
      };
      
      testAPI();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Smart suggestions based on current lab state
  const getContextualSuggestions = () => {
    const suggestions = [];

    if (!currentExperiment && !reactionState) {
      return [
        { question: "How do I start an experiment?", answer: "Select an experiment template and choose your equipment!" },
        { question: "What safety precautions should I know?", answer: "Always observe proper lab safety - watch for heat, gases, and chemical reactions!" }
      ];
    }

    if (reactionState) {
      // pH-based suggestions
      if (reactionState.pH < 6.5) {
        suggestions.push({ 
          question: `Why is my solution acidic (pH ${reactionState.pH.toFixed(1)})?`, 
          answer: "The pH below 7 indicates excess H+ ions from acids in your solution." 
        });
      } else if (reactionState.pH > 7.5) {
        suggestions.push({ 
          question: `Why is my solution basic (pH ${reactionState.pH.toFixed(1)})?`, 
          answer: "The pH above 7 shows excess OH- ions from bases in your solution." 
        });
      } else {
        suggestions.push({ 
          question: `Why is my solution neutral (pH ${reactionState.pH.toFixed(1)})?`, 
          answer: "You've achieved a near-perfect acid-base balance!" 
        });
      }

      // Temperature-based suggestions
      if (reactionState.temperature > 40) {
        suggestions.push({ 
          question: `Why is my solution heating up to ${reactionState.temperature.toFixed(1)}°C?`, 
          answer: "Exothermic reactions release energy as heat - this is normal for many acid-base reactions!" 
        });
      }

      // Visual observation suggestions
      if (reactionState.isBubbling || reactionState.hasGasEvolution) {
        suggestions.push({ 
          question: "What's causing the bubbling I see?", 
          answer: "Gas evolution reactions produce bubbles when gases like CO2 are formed!" 
        });
      }

      if (reactionState.hasPrecipitate) {
        suggestions.push({ 
          question: "What's the solid forming in my solution?", 
          answer: "You've created a precipitate - an insoluble solid formed when two solutions react!" 
        });
      }

      // Color-based suggestions
      if (reactionState.color !== 'clear') {
        suggestions.push({ 
          question: `Why did my solution turn ${reactionState.color}?`, 
          answer: "Color changes indicate chemical reactions and pH changes in your solution!" 
        });
      }
    }

    // Experiment-specific suggestions
    if (currentExperiment) {
      if (currentExperiment.category === 'acid-base') {
        suggestions.push({ 
          question: "How do I achieve perfect neutralization?", 
          answer: "Add acid and base slowly while monitoring pH until you reach pH 7!" 
        });
      } else if (currentExperiment.category === 'gas-evolution') {
        suggestions.push({ 
          question: "How can I collect the gas being produced?", 
          answer: "Use gas collection tubes or displacement methods to capture evolved gases!" 
        });
      }
    }

    return suggestions.slice(0, 3); // Return top 3 most relevant
  };

  // Enhanced prompt with detailed lab context awareness
  const buildContextualPrompt = (input: string) => {
    let context = `You are Dr. ChemBot, an expert chemistry assistant observing a live virtual chemistry lab. You can see everything happening in real-time.

CURRENT LAB STATE:
`;

    if (currentExperiment) {
      context += `🧪 EXPERIMENT: ${currentExperiment.name}
📋 TYPE: ${currentExperiment.category} (${currentExperiment.difficulty} level)
🎯 GOAL: ${currentExperiment.expectedOutcome}
📝 DESCRIPTION: ${currentExperiment.description}
🔧 EQUIPMENT NEEDED: ${currentExperiment.requiredEquipment.join(', ')}

`;
    }

    if (reactionState) {
      // Determine pH category
      let pHCategory = "Neutral";
      if (reactionState.pH < 6.5) pHCategory = "Acidic";
      else if (reactionState.pH > 7.5) pHCategory = "Basic";

      // Determine temperature status
      let tempStatus = "Room temperature";
      if (reactionState.temperature > 30) tempStatus = "Heated";
      if (reactionState.temperature > 60) tempStatus = "Hot";
      if (reactionState.temperature > 90) tempStatus = "Very hot/Near boiling";

      context += `⚗️ LIVE REACTION DATA:
• pH: ${reactionState.pH.toFixed(2)} (${pHCategory})
• Temperature: ${reactionState.temperature.toFixed(1)}°C (${tempStatus})
• Solution Color: ${reactionState.color}
• Volume: ${reactionState.volume.toFixed(1)} mL
• Concentration: ${reactionState.concentration.toFixed(3)} M
• Pressure: ${reactionState.pressure.toFixed(2)} atm
• Reaction Progress: ${(reactionState.reactionProgress * 100).toFixed(1)}%
• Reaction Type: ${reactionState.reactionType}

🔍 VISUAL OBSERVATIONS:
• Boiling: ${reactionState.isBoiling ? 'YES - Solution is boiling!' : 'No'}
• Bubbling: ${reactionState.isBubbling ? 'YES - Active bubbling observed' : 'No bubbling'}
• Gas Evolution: ${reactionState.hasGasEvolution ? 'YES - Gas being produced' : 'No gas production'}
• Precipitate: ${reactionState.hasPrecipitate ? 'YES - Solid precipitate formed' : 'No precipitate'}
• Components: ${reactionState.components.length > 0 ? reactionState.components.join(', ') : 'Pure solvent'}

`;
    }

    context += `STUDENT QUESTION: "${input}"

RESPONSE GUIDELINES:
✅ Reference the EXACT current lab values and observations
✅ Explain what's happening based on the live data
✅ If asked about "what's happening" or "current state", describe the exact simulation
✅ Connect observations to chemistry theory
✅ Give specific advice for the current experiment
✅ Be encouraging and educational
✅ Keep under 200 words but be specific
✅ Use the actual pH, temperature, and color values in explanations

Answer as if you're watching the experiment live and can see exactly what the student sees:`;

    return context;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
      type: 'normal'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Simulate typing delay for more natural feel
    setTimeout(() => setIsTyping(false), 1000);

    try {
      const botResponse = await getBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
        type: 'normal'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again! 🔧",
        isBot: true,
        timestamp: new Date(),
        type: 'warning'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

    const getBotResponse = async (input: string): Promise<string> => {
    // Check if API key is available and properly configured
    if (!isApiKeyConfigured) {
      console.warn('⚠️ Gemini API key not configured properly. Using fallback responses.');
      console.log('💡 To enable AI features, add your API key to the .env file:');
      console.log('   VITE_GEMINI_API_KEY=your-actual-api-key-here');
      return getFallbackResponse(input);
    }

    try {
      console.log('🚀 Using Gemini AI API for response...');
      const contextualPrompt = buildContextualPrompt(input);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextualPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        console.log('✅ Successfully received AI response from Gemini');
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      console.log('🔄 Falling back to predefined responses...');
      return getFallbackResponse(input);
    }
  };

  const getFallbackResponse = (input: string): string => {
    // Context-aware fallback responses using current lab state
    
    // If we have current lab data, provide specific responses
    if (reactionState) {
      if (input.toLowerCase().includes('what') && (input.toLowerCase().includes('happening') || input.toLowerCase().includes('see'))) {
        return `Looking at your current experiment: pH is ${reactionState.pH.toFixed(2)}, temperature is ${reactionState.temperature.toFixed(1)}°C, and your solution is ${reactionState.color}. ${reactionState.isBubbling ? 'I can see bubbling occurring!' : ''} ${reactionState.hasGasEvolution ? 'Gas is being evolved!' : ''} ${reactionState.hasPrecipitate ? 'A precipitate has formed!' : ''}`;
      }
      
      if (input.toLowerCase().includes('ph')) {
        const pHDesc = reactionState.pH < 7 ? 'acidic' : reactionState.pH > 7 ? 'basic' : 'neutral';
        return `Your current pH is ${reactionState.pH.toFixed(2)}, which means your solution is ${pHDesc}. ${reactionState.pH < 7 ? 'This indicates excess H+ ions from acids.' : reactionState.pH > 7 ? 'This shows excess OH- ions from bases.' : 'You have a perfect acid-base balance!'}`;
      }
      
      if (input.toLowerCase().includes('temperature') || input.toLowerCase().includes('hot') || input.toLowerCase().includes('heat')) {
        return `Your solution is currently at ${reactionState.temperature.toFixed(1)}°C. ${reactionState.temperature > 30 ? 'The heating indicates an exothermic reaction is occurring!' : 'The temperature is stable, showing no significant heat generation.'}`;
      }
      
      if (input.toLowerCase().includes('color') || input.toLowerCase().includes('change')) {
        return `Your solution is currently ${reactionState.color}. Color changes in chemistry often indicate pH changes, chemical reactions, or the formation of new compounds!`;
      }
      
      if (input.toLowerCase().includes('bubble') || input.toLowerCase().includes('gas')) {
        if (reactionState.isBubbling || reactionState.hasGasEvolution) {
          return `Yes! I can see bubbling in your solution right now. This indicates a gas-evolution reaction is taking place, likely producing CO2 or another gas.`;
        } else {
          return `I don't see any bubbling in your current experiment. Try adding carbonate to acid to see gas evolution!`;
        }
      }
    }

    // Experiment-specific responses
    if (currentExperiment) {
      if (input.toLowerCase().includes('experiment') || input.toLowerCase().includes('what') && input.toLowerCase().includes('doing')) {
        return `You're currently working on "${currentExperiment.name}" - ${currentExperiment.description}. Expected outcome: ${currentExperiment.expectedOutcome}`;
      }
    }

    // Keyword-based responses (existing logic)
    if (input.includes('acid') && input.includes('base')) {
      return chemistryFAQs[0].answer;
    }
    if (input.includes('safe') || input.includes('danger')) {
      return chemistryFAQs[4].answer;
    }

    // Default responses with current context
    const contextualDefaults = currentExperiment ? [
      `That's a great question about ${currentExperiment.category} reactions! Try observing how your current experiment values change.`,
      `Interesting! In your ${currentExperiment.name} experiment, try monitoring the pH and temperature changes.`,
      `Good observation! Your current experiment shows this is ${currentExperiment.difficulty} level chemistry - keep experimenting!`
    ] : [
      "That's an interesting chemistry question! Start an experiment to see live reactions.",
      "Great question! Select an experiment template to begin observing real chemical changes.",
      "Chemistry is all about observation - try starting an acid-base experiment to see pH changes!"
    ];

    return contextualDefaults[Math.floor(Math.random() * contextualDefaults.length)];
  };

  const handleQuickQuestion = async (faq: typeof chemistryFAQs[0]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: faq.question,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const botResponse = await getBotResponse(faq.question.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: faq.answer, // Fallback to the predefined answer
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Enhanced Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lab hover:shadow-glow-blue transition-all duration-300 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}
        size="lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
      </Button>

      {/* Enhanced Chat Interface */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] bg-card/95 backdrop-blur-lg border-2 border-primary/20 shadow-2xl z-40 flex flex-col rounded-xl overflow-hidden">
          {/* Enhanced Header */}
                    {/* Enhanced Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Dr. ChemBot v2.0</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Enhanced AI Chemistry Assistant</p>
                  <Badge 
                    variant={isApiKeyConfigured ? "default" : "destructive"} 
                    className="text-xs"
                  >
                    {isApiKeyConfigured ? "AI Active" : "AI Offline"}
                  </Badge>
                </div>
              </div>
              {currentExperiment && (
                <Badge variant="secondary" className="text-xs">
                  {currentExperiment.category}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover:bg-destructive/10 hover:text-destructive rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Messages */}
          <ScrollArea className="flex-1 p-4" ref={messagesEndRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom duration-300`}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      message.isBot
                        ? 'bg-secondary/50 text-secondary-foreground border border-border/20'
                        : 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-md'
                    } ${
                      message.type === 'warning' ? 'border-orange-400/50 bg-orange-50/10' :
                      message.type === 'success' ? 'border-green-400/50 bg-green-50/10' : ''
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.isBot && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 opacity-50" />
                          <span className="text-xs opacity-50">AI</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enhanced Loading indicator */}
              {(isLoading || isTyping) && (
                <div className="flex gap-3 animate-in slide-in-from-bottom duration-300">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-2xl max-w-[75%] flex items-center gap-2 border border-border/20">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                      {isTyping ? 'Thinking...' : 'Processing...'}
                    </span>
                  </div>
                </div>
              )}
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about chemistry..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} size="sm" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;