"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/utils/uploadthing";

export default function UploadPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-1 p-6 bg-gray-50">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-600">Upload Files</h1>
        <p className="text-gray-400 mb-2">Upload audio or video files to transcribe</p>
      </div>

      <UploadDropzone
        endpoint="audioUpload"
        appearance={{
          container: { padding: "16px", minHeight: "auto" },
          label: { marginBottom: "8px" },
          button: { marginTop: "8px" },
        }}
        onClientUploadComplete={(res) => {
          if (res?.[0]) {
            // Save uploaded file info and go to transcription page
            sessionStorage.setItem(
              "uploadedFile",
              JSON.stringify({ ufsUrl: res[0].ufsUrl, name: res[0].name })
            );
            router.push("/transcription");
          }
        }}
        onUploadError={(uploadError: Error) => {
          setError(`ERROR: ${uploadError.message}`);
        }}
      />

      {error && (
        <div className="w-full max-w-md mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </main>
  );
}
