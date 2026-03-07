import { useEffect, useState } from "react";
import "./App.css";
import SuggestionPanel from "./components/SuggestionPanel";

function App() {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setSuggestions([
        "BlobServiceClient.fromConnectionString(connectionString)",
        'blobServiceClient.getContainerClient("images")',
        'containerClient.uploadBlockBlob("file.jpg", data)'
      ]);
    }, 2000);
  }, []);

  return (
    <div className="container">
      <h1>Azure AI Suggestions</h1>

      {suggestions ? (
        <SuggestionPanel suggestions={suggestions} />
      ) : (
        <p>Generating Azure suggestion...</p>
      )}
    </div>
  );
}

export default App;