interface SuggestionPanelProps {
  suggestions: string[];
}

function SuggestionPanel({ suggestions }: SuggestionPanelProps) {
  return (
    <div className="suggestion-panel">
      <h2>Suggestions</h2>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>
            <pre>
              <code>{suggestion}</code>
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestionPanel;
