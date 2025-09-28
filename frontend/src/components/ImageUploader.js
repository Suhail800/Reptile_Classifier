import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

// A simple spinner component
const Spinner = () => (
  <div className="border-4 border-gray-500 border-t-green-400 rounded-full w-12 h-12 animate-spin"></div>
);

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setPredictions([]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    multiple: false,
  });

  const handlePredict = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPredictions(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setPredictions([]);
    setError(null);
  };

  const dropzoneClasses = `
    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
    ${
      isDragActive
        ? "border-green-400 bg-gray-700"
        : "border-gray-600 hover:border-green-500 hover:bg-gray-800"
    }
  `;

  const topPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
      <div {...getRootProps()} className={dropzoneClasses}>
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-80 rounded-lg shadow-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <p className="text-white text-lg font-semibold">Change Image</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 16v4m0 0l-3-3m3 3l3-3m-3-3V6"
              />
            </svg>
            <p className="text-lg">
              {isDragActive
                ? "Drop the image here..."
                : "Drag & drop an image here, or click to select"}
            </p>
            <p className="text-sm">Supports: PNG, JPG, JPEG</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handlePredict}
          disabled={!file || isLoading}
          className="flex-grow bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Classifying..." : "Classify Reptile"}
        </button>
        {(file || predictions.length > 0 || error) && (
          <button
            onClick={handleClear}
            className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="bg-red-900 border border-red-500 text-red-300 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-6">
          {/* Top Prediction */}
          <div className="bg-gray-700 p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-gray-300">
              Top Prediction
            </h3>
            <p className="text-4xl font-bold text-green-400 my-2">
              {topPrediction.class.replace(/_/g, " ")}
            </p>
            <p className="text-2xl text-gray-400">
              Confidence: {(topPrediction.confidence * 100).toFixed(2)}%
            </p>
          </div>

          {/* All Predictions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">
              All Probabilities
            </h3>
            <div className="space-y-2">
              {predictions.map((pred, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-3 rounded-md flex items-center justify-between gap-4"
                >
                  <span className="font-medium text-gray-200 w-1/3">
                    {pred.class.replace(/_/g, " ")}
                  </span>
                  <div className="w-2/3 bg-gray-600 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full text-xs text-black font-bold flex items-center justify-center"
                      style={{ width: `${pred.confidence * 100}%` }}
                    >
                      {(pred.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
