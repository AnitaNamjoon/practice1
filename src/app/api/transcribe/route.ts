// Use Server
// import axios
//Set up API key  from the .env
// Define your headers - Set up authorization and content type
// Set up Function  - dont forget to export  
// Submit transcription request 
// const transcript =  await  axios.post (url, )
// do not console log  instead return {
// url: file.ufsUrl,
//};

import { NextRequest, NextResponse } from "next/server"; // They come from Next.js, it handles HTTP requests and send responses
import { AssemblyAI } from "assemblyai";

interface TranscriptionResponse {
  url: string;
  transcription: string;
  
}

export async function POST(req: NextRequest): Promise<NextResponse<TranscriptionResponse | { error: string; details?: string }>> {
  try {
    const { url, language } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid audio URL is required" }, { status: 400 });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "AssemblyAI API key not configured" }, { status: 500 });
    }

    const cleanUrl = url.split("?")[0];

    const client = new AssemblyAI({
      apiKey: apiKey,
    });

    // Build transcript params — language_code and language_detection are mutually exclusive
    const transcriptParams: Parameters<typeof client.transcripts.transcribe>[0] =
      language && typeof language === "string" //Checking if a language was provided 
        ? {
          
          audio: cleanUrl,
          speech_models: ["universal-2"],
          language_code: language,
          speaker_labels: true,
          speakers_expected: 2,
        }
        : {
          // No language: let AssemblyAI auto-detect
          audio: cleanUrl,
          speech_models: ["universal-2"],
          language_detection: true,
          speaker_labels: true,
          speakers_expected: 2,
        };

    const transcript = await client.transcripts.transcribe(transcriptParams);

    let transcription = "";
    if (transcript.utterances && transcript.utterances.length > 0) {
      transcription = transcript.utterances
        .map((utterance) => `Speaker ${utterance.speaker}: ${utterance.text}`)
        .join("\n\n");
    } else {
      transcription = transcript.text || "";
    }


    console.log(transcript) // mutation from convex

    return NextResponse.json({
      url: cleanUrl,
      transcription: transcription,
    });
  } catch (error) {
    console.error("[/api/transcribe] Error:", error);
    return NextResponse.json(
      {
        error: "Transcription request failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}