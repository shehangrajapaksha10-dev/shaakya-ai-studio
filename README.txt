SHAakya AI Studio — iPhone PWA with MP4 export

This is an installable web app (PWA), not a signed native iOS .ipa.
It must be hosted on an HTTPS website. Open the hosted site in Safari, tap Share, then Add to Home Screen.

Features:
- Sinhala story input and scene planning
- Rule-based English video prompts per scene
- Browser text-to-speech preview (Sinhala voice depends on iOS voices)
- Upload/preview one video clip per scene
- Upload a complete narration audio file (MP3/M4A/WAV)
- Browser-native MP4 export by stitching the scene clips with narration audio, when iOS Safari supports MP4 MediaRecorder
- Project JSON export/import
- PWA icon and offline cache shell

MP4 export requirements and limitations:
- Every scene needs a video clip. A single narration audio file is required.
- Export is encoded by the browser; it does not generate new AI footage.
- If the browser does not support MP4 MediaRecorder, export will stop rather than saving a fake .mp4 file.
- Long/high-resolution videos may exceed iPhone memory or time limits. Try short clips first.
- Keep all files and the icons folder together when publishing to HTTPS.

Not included: automatic AI video generation or AI voice generation.
