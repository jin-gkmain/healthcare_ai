import React, { type JSX } from "react";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
  className = "",
}) => {
  // 줄바꿈과 기본 마크다운 처리
  const processContent = (text: string) => {
    if (!text) return [];

    // 줄바꿈을 기준으로 먼저 분할
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      if (line.trim() === "") {
        // 빈 줄 처리 - 적절한 여백 추가
        elements.push(<div key={`empty-${lineIndex}`} className="h-3"></div>);
        return;
      }

      // 각 줄의 마크다운 처리
      const processedLine = processLineMarkdown(line);
      elements.push(
        <div key={`line-${lineIndex}`} className="mb-1">
          {processedLine}
        </div>
      );
    });

    return elements;
  };

  // 한 줄 내의 마크다운 처리
  const processLineMarkdown = (line: string): React.ReactNode[] => {
    const remaining = line;
    const partIndex = 0;

    // 헤딩 처리
    const headingMatch = remaining.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const HeadingTag = `h${Math.min(
        level,
        4
      )}` as keyof JSX.IntrinsicElements;

      return [
        <HeadingTag
          key={`heading-${partIndex}`}
          className={`
          ${level === 1 ? "text-lg font-semibold text-primary mt-4 mb-2" : ""}
          ${
            level === 2
              ? "text-base font-semibold text-foreground mt-3 mb-2"
              : ""
          }
          ${level === 3 ? "text-sm font-medium text-foreground mt-2 mb-1" : ""}
          ${
            level >= 4
              ? "text-sm font-medium text-muted-foreground mt-2 mb-1"
              : ""
          }
        `}
        >
          {text}
        </HeadingTag>,
      ];
    }

    // 리스트 아이템 처리
    const listMatch = remaining.match(/^\s*[-*+•]\s+(.+)$/);
    if (listMatch) {
      return [
        <div key={`list-${partIndex}`} className="flex items-start gap-2 my-1">
          <span className="text-primary font-bold mt-0.5">•</span>
          <span className="flex-1">{processInlineMarkdown(listMatch[1])}</span>
        </div>,
      ];
    }

    // 숫자 리스트 처리
    const numberedListMatch = remaining.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numberedListMatch) {
      return [
        <div
          key={`numbered-list-${partIndex}`}
          className="flex items-start gap-2 my-1"
        >
          <span className="text-primary font-semibold mt-0.5 min-w-fit">
            {numberedListMatch[1]}.
          </span>
          <span className="flex-1">
            {processInlineMarkdown(numberedListMatch[2])}
          </span>
        </div>,
      ];
    }

    // 인용문 처리
    const quoteMatch = remaining.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      return [
        <div
          key={`quote-${partIndex}`}
          className="border-l-3 border-primary/50 pl-4 py-2 my-2 bg-muted/30 rounded-r"
        >
          <span className="text-muted-foreground italic">
            {processInlineMarkdown(quoteMatch[1])}
          </span>
        </div>,
      ];
    }

    // 일반 텍스트의 인라인 마크다운 처리
    return [
      <span key={`text-${partIndex}`} className="leading-relaxed">
        {processInlineMarkdown(remaining)}
      </span>,
    ];
  };

  // 인라인 마크다운 처리 (볼드, 이탤릭 등)
  const processInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;

    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partIndex = 0;

    while (remaining.length > 0) {
      // 볼드 처리 (**text**)
      const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)$/);
      if (boldMatch && boldMatch[2]) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(
          <strong
            key={`bold-${partIndex++}`}
            className="font-semibold text-primary"
          >
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
        continue;
      }

      // 이탤릭 처리 (*text*)
      const italicMatch = remaining.match(/^(.*?)\*([^*]+?)\*(.*)$/);
      if (italicMatch && italicMatch[2] && !remaining.includes("**")) {
        if (italicMatch[1]) parts.push(italicMatch[1]);
        parts.push(
          <em
            key={`italic-${partIndex++}`}
            className="italic text-muted-foreground"
          >
            {italicMatch[2]}
          </em>
        );
        remaining = italicMatch[3];
        continue;
      }

      // 인라인 코드 처리 (`code`)
      const codeMatch = remaining.match(/^(.*?)`([^`]+?)`(.*)$/);
      if (codeMatch && codeMatch[2]) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(
          <code
            key={`code-${partIndex++}`}
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
          >
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // 하이라이트 처리 (==text==)
      const highlightMatch = remaining.match(/^(.*?)==(.*?)==(.*)$/);
      if (highlightMatch && highlightMatch[2]) {
        if (highlightMatch[1]) parts.push(highlightMatch[1]);
        parts.push(
          <mark
            key={`highlight-${partIndex++}`}
            className="bg-primary/20 text-primary px-1 rounded"
          >
            {highlightMatch[2]}
          </mark>
        );
        remaining = highlightMatch[3];
        continue;
      }

      // 일반 텍스트
      parts.push(remaining);
      break;
    }

    return <>{parts}</>;
  };

  const processedElements = processContent(content);

  return (
    <div
      className={`ai-response leading-relaxed ${className} ${
        isStreaming ? "streaming-content" : ""
      }`}
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {processedElements}
      {isStreaming && <span className="typing-cursor"></span>}
    </div>
  );
};
