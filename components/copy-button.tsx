"use client"

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}