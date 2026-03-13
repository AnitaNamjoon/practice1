"use client";

import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import axios from "axios";

interface UploadedFile {
  ufsUrl: string;
  name: string;
}

interface TranscriptionResponse {
  url: string;
  transcription: string;
}

interface ApiError {
  error: string;
  details?: string;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "sw", label: "Swahili" },
] as const;

type LanguageCode = typeof LANGUAGES[number]["code"];

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string>("");
  const [language, setLanguage] = useState<LanguageCode>("en");

  const handleTranscribe = async () => {
    if (!uploadedFile) return;

    setIsTranscribing(true);
    setError("");
    setTranscription("");

    try {
      const response = await axios.post<TranscriptionResponse>(
        "/api/transcribe",
        {
          url: uploadedFile.ufsUrl,
          language,
        },
      );

      setTranscription(response.data.transcription);
    } catch (err) {
      const message = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.error || "Transcription failed"
        : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearStates = () => {
    setTranscription("");
    setError("");
  };

  return (
    <main className="min-h-screen  flex-col items-center justify-center gap-1 p-2 bg-gray-50">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-600">Upload Files</h1>
        <p className="text-gray-400 mb-2">Upload audio or video files</p>
      </div>



      <UploadDropzone
        endpoint="audioUpload"
        appearance={{
          container: {
            padding: "16px",
            minHeight: "auto",
          },
          label: {
            marginBottom: "8px",
          },
          button: {
            marginTop: "8px",
          },
        }}
        onClientUploadComplete={(res) => {
          if (res?.[0]) {
            setUploadedFile({
              ufsUrl: res[0].ufsUrl,
              name: res[0].name,
            });
            clearStates();
          }
        }}
        onUploadError={(uploadError: Error) => {
          setError(`ERROR: ${uploadError.message}`);
        }}
      />

      {uploadedFile && (
        <FileCard
          file={uploadedFile}
          isTranscribing={isTranscribing}
          onTranscribe={handleTranscribe}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      {error && <ErrorAlert message={error} />}

      {transcription && <TranscriptionResult text={transcription} />}
    </main>
  );
}

function FileCard({
  file,
  isTranscribing,
  onTranscribe,
  language,
  onLanguageChange,
}: {
  file: UploadedFile;
  isTranscribing: boolean;
  onTranscribe: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}) {
  return (
    <div className="w-full max-w-md mt-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-semibold">Uploaded:</span> {file.name}
        </p>
        <p className="text-xs text-gray-500 mb-4 break-all">{file.ufsUrl}</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transcription Language
        </label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          disabled={isTranscribing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={onTranscribe}
          disabled={isTranscribing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isTranscribing ? `Transcribing in ${LANGUAGES.find(l => l.code === language)?.label}...` : "Transcribe"}
        </button>
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="w-full max-w-md mt-4">
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

function TranscriptionResult({ text }: { text: string }) {
  // Split on "Speaker X:" boundaries while keeping the label with its text
  const utterances = text
    .split(/(?=Speaker [A-Z]:)/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="w-full max-w-2xl mt-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-1">Transcription</h3>
        <p className="text-xs text-gray-400 mb-4">Detected: English</p>
        <div className="space-y-4">
          {utterances.map((utterance, i) => {
            const colonIdx = utterance.indexOf(":");
            const label = colonIdx !== -1 ? utterance.slice(0, colonIdx + 1) : "";
            const body = colonIdx !== -1 ? utterance.slice(colonIdx + 1).trim() : utterance;
            return (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                {label && (
                  <span className="font-semibold text-gray-900">{label} </span>
                )}
                {body}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
