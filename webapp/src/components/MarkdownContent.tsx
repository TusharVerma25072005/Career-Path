interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
  // Simple markdown-like formatting without external dependencies
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mb-2 mt-3">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mb-3 mt-4">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-4 mt-4">{line.replace('# ', '')}</h1>;
        }
        
        // Lists
        if (line.match(/^\d+\.\s/)) {
          return <li key={index} className="ml-6 mb-1">{line.replace(/^\d+\.\s/, '')}</li>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="ml-6 mb-1 list-disc">{line.replace(/^[-*]\s/, '')}</li>;
        }
        
        // Bold text
        const boldFormatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        return <p key={index} className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
      });
  };

  return (
    <div className="prose prose-sm max-w-none">
      {formatContent(content)}
    </div>
  );
};

export default MarkdownContent;
