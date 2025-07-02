"use client";

import { useState, useEffect, useCallback } from 'react';
import { addSpeech, getAllSpeeches, deleteSpeech } from '@/lib/db';
import type { SpeechHistoryItem } from '@/types';

export const useSpeechHistory = () => {
  const [history, setHistory] = useState<SpeechHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const speeches = await getAllSpeeches();
      setHistory(speeches.map(s => ({ ...s, createdAt: new Date(s.createdAt) })));
    } catch (error) {
      console.error("Failed to load speech history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshHistory();
    }
  }, [refreshHistory]);

  const addSpeechItem = async (item: SpeechHistoryItem) => {
    await addSpeech(item);
    await refreshHistory();
  };

  const removeSpeechItem = async (id: number) => {
    await deleteSpeech(id);
    await refreshHistory();
  };

  return { history, isLoading, addSpeechItem, removeSpeechItem };
};
