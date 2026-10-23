# EchoLens AI

**Browser-Based Speech and Emotion-Cue Analysis Prototype**

EchoLens AI is an interactive web application for exploring speech delivery through audio-derived features and transcript-based linguistic cues. It provides an analysis workflow, time-aligned visualizations, demo scenarios, and a browser-local library of reports.

> **Scientific and implementation note:** The current implementation is a client-side prototype, not a trained machine-learning emotion-recognition system. Audio features are computed with the Web Audio API; text sentiment and emotion cues come from a hand-built lexicon and heuristics. Speech-to-text availability depends on the browser. The scores are exploratory indicators of delivery and language, not measurements of a person's internal emotional state.

## Features

- Demo analyses to explore the interface without a recording.
- Audio file upload and live recording workflows where browser APIs are supported.
- Optional browser speech recognition, with manual transcript entry as a fallback.
- Audio decoding and mono downmix using the Web Audio API.
- RMS energy, zero-crossing rate, pause detection, waveform, and energy-curve calculations.
- Lexicon-based sentiment, emotion-cue, keyword, filler-word, and readability metrics.
- Segment-oriented timeline, emotion distribution charts, and delivery metrics.
- Analysis library stored in browser `localStorage`.
- Report export/print interactions in the UI.
- Methodology and about pages describing the prototype's analysis approach.

## Technology stack

- **UI:** React 19, TypeScript, HTML5, CSS, Tailwind CSS 4.
- **Build tooling:** Vite 7, TypeScript, ESLint.
- **Navigation:** React Router (hash-based routing).
- **Charts and animation:** Recharts, Framer Motion, Lucide React.
- **Browser APIs:** Web Audio API, MediaRecorder, optional Web Speech API, Web Storage API.

## How the analysis works

```text
Audio upload / microphone / demo
             │
             ├── Web Audio API: decode, downmix, frame-level RMS and ZCR
             ├── Pause and energy-curve heuristics
             └── Transcript (browser speech recognition or user-provided text)
                              │
                              ▼
                Lexicon-based text analysis
                ├── sentiment polarity heuristic
                ├── emotion-cue word counts
                ├── keyword and filler statistics
                └── segment metrics and visualizations
                              │
                              ▼
                 Browser-local analysis library
```

Some displayed fields are heuristically estimated or normalized for visualization. Zero-crossing rate is not a full spectral model, and it should not be interpreted as a robust pitch estimator. The app does not send audio to a cloud AI service or run a Python DSP pipeline.

## Requirements

- Node.js 20.19+ or 22.12+ recommended for current Vite releases.
- npm.
- A modern browser. Microphone recording requires permission and a secure context (localhost or HTTPS). Speech recognition support varies by browser.

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Quality checks

```bash
npm run build
npm run lint
npm run preview
```

The production bundle is written to `dist/`. No automated unit-test script is currently configured.

## Deployment

EchoLens AI can be deployed as a static Vite site.

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Root directory:** repository root

Deploy behind HTTPS to enable microphone access on supported browsers. Browser speech recognition is not universally supported, so preserve the manual transcript fallback when demonstrating the project.

## Privacy and limitations

- Audio processing is performed in the browser by the current implementation; the app does not require a remote analysis API.
- Saved analyses are kept in the current browser's local storage and are not synced to a server.
- Browser microphone permission is required for live recording.
- Speech recognition may use browser/vendor services depending on browser implementation and settings; do not assume every transcription path is fully offline.
- Emotion labels are statistical/lexical cues and can be affected by language, context, accent, transcription quality, sarcasm, and individual differences.
- Do not use the output for hiring, clinical diagnosis, discipline, surveillance, or other high-impact judgments about people.
- Avoid uploading sensitive recordings unless you have the necessary consent and rights.

## Suggested academic objectives (Web Technology)

- Integrate browser multimedia APIs into a React application.
- Handle recording, file input, asynchronous processing, and browser capability fallbacks.
- Transform raw audio and text into derived metrics and interactive visualizations.
- Persist user-created records using browser storage.
- Document the limits of heuristic inference and communicate uncertainty responsibly.

## Project structure

```text
src/
├── components/       # Layout, timeline, and chart components
├── pages/            # Landing, analyzer, library, report, methodology, about
├── lib/audio.ts      # Web Audio feature extraction and analysis assembly
├── lib/nlp.ts        # Lexicon-based text metrics and emotion cues
├── lib/demos.ts      # Sample analysis fixtures
├── lib/store.ts      # Browser-local analysis library
├── lib/analysisContext.tsx # Shared current-analysis state
├── App.tsx           # Hash router and application routes
└── main.tsx          # React entry point
```

## License

No license is currently specified. Add a license before redistributing the project.
