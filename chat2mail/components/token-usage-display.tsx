"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TokenUsageProps = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  maxTokens?: number;
  className?: string;
};

export function TokenUsageDisplay({
  inputTokens,
  outputTokens,
  totalTokens,
  maxTokens = 32000, // Default max tokens for Gemini Flash 2.0
  className,
}: TokenUsageProps) {
  // Calculate percentages for progress bar
  const usagePercentage = Math.min(Math.round((totalTokens / maxTokens) * 100), 100);
  
  return (
    <Card className={`p-4 border-0 shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Token Usage
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p className="text-xs">Tokens are units of text processed by the AI model. This shows your current request's usage.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {totalTokens.toLocaleString()} / {maxTokens.toLocaleString()}
          </span>
        </div>
        
        <Progress value={usagePercentage} className="h-2" />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Input:</span>
            <span className="ml-1 font-medium text-indigo-600 dark:text-indigo-400">
              {inputTokens.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Output:</span>
            <span className="ml-1 font-medium text-purple-600 dark:text-purple-400">
              {outputTokens.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
