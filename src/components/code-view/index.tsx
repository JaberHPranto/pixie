import Prism from "prismjs";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-yaml";

import "./code-theme.css";

interface Props {
  code: string;
  lang: string;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  html: "markup",
  xml: "markup",
  md: "markdown",
  yml: "yaml",
  sh: "bash",
};

const getPrismLanguage = (lang: string) => {
  const normalizedLanguage = LANGUAGE_ALIASES[lang] ?? lang;

  if (Prism.languages[normalizedLanguage]) {
    return normalizedLanguage;
  }

  return "javascript";
};

export const CodeView = ({ code, lang }: Props) => {
  const language = getPrismLanguage(lang.toLowerCase());
  const grammar = Prism.languages[language] ?? Prism.languages.javascript;
  const highlightedCode = Prism.highlight(code, grammar, language);
  const lines = highlightedCode.split("\n");

  return (
    <div className="code-view-container h-full overflow-hidden">
      <pre className="code-view-pre m-0 h-[calc(100%-0px)] overflow-auto px-0 py-2 text-sm leading-6">
        <code className={`language-${language} block min-w-full`}>
          {lines.map((line, index) => (
            <span key={`${language}-${index}`} className="code-view-line">
              <span className="code-view-line-number">{index + 1}</span>
              <span
                className="code-view-line-content"
                dangerouslySetInnerHTML={{ __html: line || " " }}
              />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};
