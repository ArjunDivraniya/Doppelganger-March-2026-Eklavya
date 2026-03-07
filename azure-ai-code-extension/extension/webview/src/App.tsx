import "./App.css";
import SuggestionPanel from "./components/SuggestionPanel";

function App() {
  const suggestion =
    "BlobServiceClient.fromConnectionString(connectionString)";

  return (
    <div className="container">
      <h1>Azure AI Suggestions</h1>

      <SuggestionPanel suggestion={suggestion} />
    </div>
  );
}

export default App;