"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { History, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SpeechHistoryItem } from "@/types";

interface HistorySidebarProps {
  history: SpeechHistoryItem[];
  isLoading: boolean;
  onSelect: (item: SpeechHistoryItem) => void;
  onDelete: (id: number) => void;
  currentSpeechId?: number | null;
}

export function HistorySidebar({
  history,
  isLoading,
  onSelect,
  onDelete,
  currentSpeechId,
}: HistorySidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-background border-r p-4 gap-4">
       <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">History</h2>
      </div>
      <ScrollArea className="flex-1 -mx-4">
        <div className="px-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>No speech generated yet.</p>
            <p className="text-sm">Your history will appear here.</p>
          </div>
        ) : (
          history.map((item) => (
            <Card
              key={item.id}
              onClick={() => onSelect(item)}
              className={`cursor-pointer transition-all hover:border-primary ${
                currentSpeechId === item.id ? "border-primary bg-primary/10" : ""
              }`}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    aria-label="Delete history item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      </ScrollArea>
    </aside>
  );
}
