import React from "react";
import ImageUploader from "./components/ImageUploader";
import "./App.css";

function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-400">
          Reptile Classifier AI
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Upload an image to identify a reptile with our advanced AI model.
        </p>
      </header>
      <main className="w-full max-w-4xl">
        <ImageUploader />
      </main>
      <footer className="w-full max-w-4xl text-center mt-auto pt-8">
        <p className="text-gray-500">
          Built with React, Flask, and TensorFlow/Keras
        </p>
      </footer>
    </div>
  );
}

export default App;
