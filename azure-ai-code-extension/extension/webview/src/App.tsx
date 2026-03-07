import { useEffect, useState } from "react";
import "./App.css";
import SuggestionPanel from "./components/SuggestionPanel";

function App() {
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setSuggestion(
        "BlobServiceClient.fromConnectionString(connectionString)"
      );
    }, 2000);
  }, []);

  return (
    <div className="container">
      <h1>Azure AI Suggestions</h1>

      {suggestion ? (
        <SuggestionPanel suggestion={suggestion} />
      ) : (
        <p>Generating Azure suggestion...</p>
      )}
    </div>
  );
}

export default App;