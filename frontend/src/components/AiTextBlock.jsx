import ReactMarkdown from "react-markdown";
import { getTextAlign, getTextDirection } from "../helpers/generalFunctions";

function AiTextBlock({ text, className = "" }) {
  const direction = getTextDirection(text || "");
  const textAlign = getTextAlign(text || "");

  return (
    <div
      className={`ai-text-block ${className}`}
      dir={direction}
      style={{ textAlign }}
    >
      <ReactMarkdown>{text || ""}</ReactMarkdown>
    </div>
  );
}

export default AiTextBlock;