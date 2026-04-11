
import React from 'react';

interface HighlightMatchProps {
  text: string;
  match: string;
}

const HighlightMatch: React.FC<HighlightMatchProps> = ({ text, match }) => {
  if (!match.trim() || !text) return <>{text}</>;

  const parts = text.split(new RegExp(`(${match})`, 'gi'));

  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === match.toLowerCase() ? (
          <span key={i} className="bg-primary/20 text-primary font-black rounded px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightMatch;
