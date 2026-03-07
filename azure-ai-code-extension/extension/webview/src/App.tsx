import "./App.css";

function App() {
  const suggestion =
    "BlobServiceClient.fromConnectionString(connectionString)";

  return (
    <div className="container">
      <h1>Azure AI Suggestions</h1>

      <div className="suggestion-card">
        <h3>Suggested Code</h3>

        <pre className="code-block">{suggestion}</pre>

        <div className="buttons">
          <button className="insert-btn">Insert Code</button>
          <button className="ignore-btn">Ignore</button>
        </div>
      </div>
    </div>
  );
}

export default App;