interface SuggestionPanelProps {
  suggestion: string;
}

function SuggestionPanel({ suggestion }: SuggestionPanelProps) {
  return (
    <div className="suggestion-panel">
      <h2>Suggestion</h2>
      <pre>
        <code>{suggestion}</code>
      </pre>
    </div>
  );
}

export default SuggestionPanel;
