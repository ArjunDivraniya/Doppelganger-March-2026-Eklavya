export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <span>
          Built with ⚡ by{" "}
          <span className="text-gray-300 font-medium">Team Eklavya</span>
        </span>
        <span className="flex items-center gap-1">
          Powered by{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">
            Azure OpenAI
          </span>
        </span>
      </div>
    </footer>
  );
}
