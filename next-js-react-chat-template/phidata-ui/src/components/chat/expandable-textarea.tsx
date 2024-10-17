import React, { useRef, useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

interface ExpandableTextareaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const ExpandableTextarea: React.FC<ExpandableTextareaProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  isLoading = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState<string>("auto");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaHeight("auto");
    onChange(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="flex-grow bg-gray-100 rounded-lg relative px-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            height: textareaHeight,
            maxHeight: "200px",
            overflowY: value ? "auto" : "hidden",
          }}
          className="w-full resize-none bg-transparent rounded-lg py-3 pr-20 pl-4 text-gray-800 placeholder-gray-500
                     focus:outline-none focus:ring-0 focus:ring-offset-0
                     border-none shadow-none
                     focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        />
        <button
          onClick={onSend}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700" />
          ) : (
            <SendHorizontal size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ExpandableTextarea;