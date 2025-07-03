import { useState, useEffect } from "react";
import type { ChatMessage } from "../types";

const CHAT_HISTORY_KEY = "ai-health-chat-history";

const getInitialMessage = (): ChatMessage => ({
  id: "1",
  type: "ai",
  content:
    "안녕하세요! 저는 AI 건강 상담사입니다. 건강에 관한 질문이나 증상에 대해 문의해 주세요. 어떤 도움이 필요하신가요?",
  timestamp: new Date(),
});

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    getInitialMessage(),
  ]);

  // 컴포넌트 마운트 시 로컬 스토리지에서 채팅 기록 불러오기
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // 빈 배열이거나 유효하지 않은 데이터인 경우 초기 메시지만 사용
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          // timestamp를 Date 객체로 변환
          const messagesWithDates = parsedHistory.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
        }
      }
    } catch (error) {
      console.error("채팅 기록을 불러오는 중 오류 발생:", error);
      // 오류 발생 시 로컬 스토리지 초기화
      localStorage.removeItem(CHAT_HISTORY_KEY);
      setMessages([getInitialMessage()]);
    }
  }, []);

  // 메시지가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("채팅 기록을 저장하는 중 오류 발생:", error);
    }
  }, [messages]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearHistory = () => {
    const initialMessage = getInitialMessage();
    setMessages([initialMessage]);
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([initialMessage]));
    } catch (error) {
      console.error("채팅 기록 초기화 중 오류 발생:", error);
    }
  };

  return {
    messages,
    setMessages,
    addMessage,
    clearHistory,
  };
}
