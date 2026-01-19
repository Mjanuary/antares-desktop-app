import React from "react";

const MinimizeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 10h10v1H5v-1z" clipRule="evenodd" />
  </svg>
);
const MaximizeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3 3h14v14H3V3zm2 2v10h10V5H5z"
      clipRule="evenodd"
    />
  </svg>
);

// A simple square, Electron usually handles the actual maximize icon states
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export const Home: React.FC = () => {
  return (
    <div className="flex-grow">
      {/* AppBar */}
      <header className="bg-blue-600 text-white">
        <nav className="flex items-center px-4 h-16">
          <h1 className="text-xl font-semibold flex-grow">
            Antares v23 janvier ui 22
          </h1>
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="p-2 hover:bg-blue-700 rounded"
            aria-label="Minimize"
          >
            <MinimizeIcon />
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="p-2 hover:bg-blue-700 rounded"
            aria-label="Maximize"
          >
            <MaximizeIcon />
          </button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="p-2 hover:bg-blue-700 rounded"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </nav>
      </header>

      {/* Container */}
      <main className="max-w-7xl mx-auto mt-4 px-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Welcome to Antares</h2>
          <p className="text-gray-600">
            Select an app from the sidebar to get started.
          </p>
        </div>
      </main>
    </div>
  );
};
