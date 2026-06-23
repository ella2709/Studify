import ReactMarkdown from "react-markdown";
import { getTextAlign, getTextDirection } from "../helpers/textHelper";

function AiTextBlock({ text, className = "" }) {
  const direction = getTextDirection(text || "");
  const textAlign = getTextAlign(text || "");

  return (
    <div
      className={`ai-text-block prose prose-sm max-w-none ${className}`}
      dir={direction}
      style={{ textAlign }}
    >
      <ReactMarkdown>{text || ""}</ReactMarkdown>
    </div>
  );
}

export default AiTextBlock;
