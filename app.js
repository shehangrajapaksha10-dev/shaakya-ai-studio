const $ = (id) => document.getElementById(id);
let scenes = [];
let clipUrls = [];
let clipFiles = [];
let voices = [];

const sampleStory = `හෝර්ටන් පෙදෙසේ ශාක්‍ය දිසානායකගේ කාමරය සිතියම් සහ දත්ත වාර්තාවලින් පිරී තිබුණි. එවිට පොලිස්පතිවරයාගේ සහකාරවරයා රොෂාන් වෙදගෙදරගේ මරණය ගැන පුවතක් රැගෙන ආවේය.

ගංවතුර සහ නායයෑම අතරතුර රොෂාන්ගේ බංගලාව යටවී තිබුණි. ඔහුගේ සිරුර හමුවූයේ පපුවේ වෙඩි උණ්ඩයක් සමඟය. ඔහුගේ වටිනා Blue Giant නිල් මැණික අතුරුදහන් වී තිබුණි.

ශාක්‍ය සහ ඩොක්ටර් සමීර රත්නපුරයට ගොස් සාක්ෂි පරීක්ෂා කළහ. මළ සිරුරේ නියපොතු යට තිබූ නිල් පැහැති මැටි සහ පෙනහළු තුළ තිබූ ක්ලෝරීන් මිශ්‍ර ජලය ඔවුන්ට අලුත් ඉඟි ලබා දුන්නේය.

අවසානයේ ශාක්‍ය හෙළි කළේ මිනීමැරුම, මැණික් සොරකම සහ පවුලේ රහස් සඟවා තැබීම යන වෙන වෙනම අරමුණු තුනක් තිබූ බවයි.`;

function splitIntoScenes(text) {
  const paragraphs = text.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;
  const sentences = text.match(/[^.!?।]+[.!?।]?/g) || [text];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if ((current + " " + s).length > 420 && current) {
      chunks.push(current.trim()); current = s;
    } else current += (current ? " " : "") + s;
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

function makePrompt(text, index) {
  const lower = text.toLowerCase();
  let setting = "Sri Lankan cinematic drama, realistic locations, dramatic natural lighting";
  if (lower.includes("ගංවතුර") || lower.includes("වැස්ස") || lower.includes("නාය")) setting = "Sri Lanka during severe monsoon flooding, heavy rain, realistic floodwater, cinematic disaster thriller";
  if (lower.includes("කාමරය") || lower.includes("සිතියම්")) setting = "dark detective office in Horton Place, Sri Lankan investigator, maps and case files, cinematic noir lighting";
  if (lower.includes("මළ සිරුර") || lower.includes("මරණය")) setting = "forensic investigation tent in Ratnapura, respectful non-graphic crime scene, cinematic mystery";
  if (lower.includes("හෙලිකොප්ටර")) setting = "helicopter flying above a flooded Sri Lankan landscape, aerial cinematic shot";
  if (lower.includes("නිල් මැණික") || lower.includes("Blue Giant")) setting = "close-up of a rare deep blue sapphire gemstone, luxury vault, suspenseful cinematic lighting";
  return `Scene ${index + 1}: ${setting}. Visualize this story moment: ${text.slice(0, 500)}. Consistent character appearance, realistic Sri Lankan environment, cinematic 4K look, no subtitles, no text, 16:9.`;
}

function renderScenes() {
  $("emptyScenes").style.display = scenes.length ? "none" : "block";
  $("sceneList").innerHTML = "";
  $("clipList").innerHTML = "";
  scenes.forEach((scene, i) => {
    const card = document.createElement("article");
    card.className = "scene-card";
    card.innerHTML = `<div class="scene-top"><span class="scene-number">SCENE ${String(i+1).padStart(2,"0")}</span><span class="scene-title">දර්ශනය ${i+1}</span></div><div class="scene-text"></div><div class="prompt"><b>VIDEO PROMPT</b><br></div>`;
    card.querySelector(".scene-text").textContent = scene;
    card.querySelector(".prompt").appendChild(document.createTextNode(makePrompt(scene, i)));
    $("sceneList").appendChild(card);

    const clip = document.createElement("div");
    clip.className = "clip-row";
    clip.innerHTML = `<strong>Scene ${i+1} — Video clip</strong><input type="file" accept="video/*" aria-label="Scene ${i+1} video clip"><div class="clip-preview"></div>`;
    const fileInput = clip.querySelector("input");
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      const preview = clip.querySelector(".clip-preview");
      preview.innerHTML = "";
      if (!file) return;
      if (clipUrls[i]) URL.revokeObjectURL(clipUrls[i]);
      clipFiles[i] = file;
      clipUrls[i] = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = clipUrls[i]; video.controls = true; video.playsInline = true;
      preview.appendChild(video);
    });
    $("clipList").appendChild(clip);
  });
  if (!scenes.length) $("clipList").innerHTML = '<div class="empty-state">මුලින් Scene හදන්න.</div>';
}

$("makeScenesBtn").addEventListener("click", () => {
  const text = $("storyText").value.trim();
  if (!text) { alert("මුලින් ඔබේ කතාව ඇතුළත් කරන්න."); return; }
  scenes = splitIntoScenes(text);
  clipUrls.forEach(url => url && URL.revokeObjectURL(url));
  clipUrls = [];
  clipFiles = [];
  renderScenes();
  $("scenesPanel").scrollIntoView({behavior:"smooth", block:"start"});
});

$("sampleBtn").addEventListener("click", () => {
  $("storyTitle").value = "ශාක්‍ය දිසානායකගේ පළමු මෙහෙයුම";
  $("storyText").value = sampleStory;
});

function loadVoices() {
  if (!("speechSynthesis" in window)) {
    $("voiceStatus").textContent = "මෙම browser එකේ voice playback පහසුකම නැහැ.";
    return;
  }
  voices = speechSynthesis.getVoices();
  const select = $("voiceSelect");
  const old = select.value;
  select.innerHTML = '<option value="">Browser default voice</option>';
  voices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${v.name} (${v.lang})${/si/i.test(v.lang) ? " — Sinhala" : ""}`;
    select.appendChild(opt);
  });
  const sinhala = voices.findIndex(v => /^si/i.test(v.lang));
  if (old) select.value = old;
  else if (sinhala >= 0) select.value = String(sinhala);
  $("voiceStatus").textContent = voices.some(v => /^si/i.test(v.lang))
    ? "Sinhala voice එකක් හමු වුණා."
    : "Sinhala voice එකක් device එකේ නොපෙනේ. Browser default voice එකෙන් උත්සාහ කළ හැක.";
}
if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

$("speakBtn").addEventListener("click", () => {
  const text = $("storyText").value.trim();
  if (!text) { alert("මුලින් කතාව ඇතුළත් කරන්න."); return; }
  if (!("speechSynthesis" in window)) { $("voiceStatus").textContent = "Voice playback support නැහැ."; return; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "si-LK";
  const selected = $("voiceSelect").value;
  if (selected !== "" && voices[Number(selected)]) utterance.voice = voices[Number(selected)];
  utterance.rate = 0.92;
  utterance.pitch = 0.95;
  utterance.onstart = () => $("voiceStatus").textContent = "Narration වාදනය වෙමින් පවතී...";
  utterance.onend = () => $("voiceStatus").textContent = "Narration අවසන්.";
  utterance.onerror = () => $("voiceStatus").textContent = "Voice එක වාදනය කළ නොහැකි වුණා. වෙනත් voice එකක් තෝරන්න.";
  speechSynthesis.speak(utterance);
});
$("stopBtn").addEventListener("click", () => {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  $("voiceStatus").textContent = "Narration නතර කළා.";
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function projectData() {
  return {
    app: "Shaakya AI Studio Free Edition",
    version: "0.1.0",
    title: $("storyTitle").value.trim(),
    story: $("storyText").value,
    scenes: scenes.map((text, i) => ({ number: i+1, text, videoPrompt: makePrompt(text, i) })),
    note: "Video files are not embedded in this JSON. Keep your original clips separately."
  };
}
$("downloadProjectBtn").addEventListener("click", () => {
  const data = projectData();
  if (!data.story.trim()) { alert("Project එක save කරන්න කලින් කතාව ඇතුළත් කරන්න."); return; }
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], {type:"application/json"}), "shaakya-ai-studio-project.json");
  $("saveStatus").textContent = "Project JSON එක download කිරීම ආරම්භ කළා.";
});
$("importProjectBtn").addEventListener("click", () => $("projectFile").click());
$("projectFile").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    $("storyTitle").value = data.title || "";
    $("storyText").value = data.story || "";
    scenes = Array.isArray(data.scenes) && data.scenes.length ? data.scenes.map(s => s.text || "") : splitIntoScenes(data.story || "");
    renderScenes();
    $("saveStatus").textContent = "Project එක import කළා.";
  } catch {
    alert("මෙම JSON project file එක කියවන්න බැහැ.");
  }
  e.target.value = "";
});


// Assemble the selected scene clips into one MP4 using the browser's native encoder.
function supportedMp4Mime() {
  if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return "";
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4;codecs=avc1',
    'video/mp4'
  ];
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || "";
}
function waitEvent(target, success, failure = "error") {
  return new Promise((resolve, reject) => {
    const clean = () => { target.removeEventListener(success, ok); target.removeEventListener(failure, bad); };
    const ok = () => { clean(); resolve(); };
    const bad = () => { clean(); reject(new Error("Media load failed")); };
    target.addEventListener(success, ok, {once:true});
    target.addEventListener(failure, bad, {once:true});
  });
}
function canvasDraw(ctx, video, canvas) {
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = "#080b12"; ctx.fillRect(0,0,w,h);
  if (video && video.readyState >= 2 && video.videoWidth) {
    const scale = Math.max(w/video.videoWidth, h/video.videoHeight);
    const dw = video.videoWidth*scale, dh = video.videoHeight*scale;
    ctx.drawImage(video, (w-dw)/2, (h-dh)/2, dw, dh);
  } else {
    ctx.fillStyle = "#d6ad69"; ctx.font = "bold 46px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(($('storyTitle').value || "SHAakya AI STUDIO").slice(0,42), w/2, h/2);
  }
}
$('exportMp4Btn').addEventListener('click', async () => {
  const status = $('exportStatus');
  const btn = $('exportMp4Btn');
  const mime = supportedMp4Mime();
  if (!mime) {
    status.textContent = "මෙම iPhone/browser එකේ MP4 recording support හමු වුණේ නැහැ. MP4 ලෙස export කළ හැකි වෙනත් browser/device එකක් අවශ්‍යයි.";
    alert("මෙම browser එක MP4 export support කරන්නේ නැහැ. වෙනත් format එකකට .mp4 කියලා නම වෙනස් කරලා save කිරීමෙන් MP4 එකක් ලැබෙන්නේ නැහැ.");
    return;
  }
  if (!scenes.length) { alert("මුලින් කතාවෙන් Scenes හදන්න."); return; }
  const missing = scenes.map((_,i)=>i+1).filter(n => !clipFiles[n-1]);
  if (missing.length) { alert("මේ Scene වලට video clip දාලා නැහැ: " + missing.join(", ")); return; }
  const narration = $('narrationFile').files && $('narrationFile').files[0];
  if (!narration) { alert("MP4 එකට ඇතුළත් කරන්න Sinhala narration audio file එකක් තෝරන්න."); return; }
  btn.disabled = true;
  let recorder, audioCtx, audioEl, rafId;
  const chunks = [];
  try {
    status.textContent = "MP4 එක සකස් කරමින්... iPhone එකේ මේ පිටුව open තබන්න.";
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    audioEl = new Audio();
    audioEl.src = URL.createObjectURL(narration);
    audioEl.preload = 'auto';
    audioEl.playsInline = true;
    await waitEvent(audioEl, 'canplaythrough');
    const audioSource = audioCtx.createMediaElementSource(audioEl);
    const audioDestination = audioCtx.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    audioDestination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
    recorder = new MediaRecorder(stream, {mimeType:mime, videoBitsPerSecond:5000000});
    const stopped = new Promise((resolve,reject) => {
      recorder.ondataavailable = e => { if(e.data && e.data.size) chunks.push(e.data); };
      recorder.onerror = () => reject(new Error("MP4 recording error"));
      recorder.onstop = resolve;
    });
    recorder.start(1000);
    await audioEl.play();
    for (let i=0; i<clipFiles.length && i<scenes.length; i++) {
      status.textContent = `Scene ${i+1} / ${scenes.length} එකතු කරමින්...`;
      const video = document.createElement('video');
      video.muted = true; video.playsInline = true; video.preload = 'auto';
      video.src = URL.createObjectURL(clipFiles[i]);
      await waitEvent(video, 'loadedmetadata');
      await video.play();
      await new Promise(resolve => {
        const draw = () => {
          canvasDraw(ctx, video, canvas);
          if (video.ended || video.paused) { canvasDraw(ctx, video, canvas); resolve(); }
          else rafId = requestAnimationFrame(draw);
        };
        draw();
        video.onended = () => { if(rafId) cancelAnimationFrame(rafId); canvasDraw(ctx, video, canvas); resolve(); };
      });
      video.pause(); URL.revokeObjectURL(video.src);
    }
    if (!audioEl.paused && !audioEl.ended) audioEl.pause();
    if (recorder.state !== 'inactive') recorder.stop();
    await stopped;
    const blob = new Blob(chunks, {type:mime.split(';')[0] || 'video/mp4'});
    if (!blob.size) throw new Error("Empty MP4 output");
    const safeTitle = ($('storyTitle').value || 'shaakya-film').replace(/[^a-z0-9\u0D80-\u0DFF_-]+/gi,'-').replace(/^-+|-+$/g,'') || 'shaakya-film';
    downloadBlob(blob, safeTitle + '.mp4');
    status.textContent = `සාර්ථකයි! ${(blob.size/1024/1024).toFixed(1)} MB MP4 file එක download කළා.`;
  } catch (err) {
    console.error(err);
    if (recorder && recorder.state !== 'inactive') { try { recorder.stop(); } catch(_){} }
    status.textContent = "Export එක අසාර්ථකයි. Clips වල format/size අඩු කරලා නැවත උත්සාහ කරන්න. iPhone එකේ Safari open තබන්න.";
    alert("MP4 export එක අසාර්ථක වුණා. කෙටි clips භාවිතා කරලා නැවත උත්සාහ කරන්න. iPhone Safari එකේ compatibility එකත් බලන්න.");
  } finally {
    if (audioEl) { audioEl.pause(); if(audioEl.src.startsWith('blob:')) URL.revokeObjectURL(audioEl.src); }
    if (audioCtx) { try { await audioCtx.close(); } catch(_){} }
    btn.disabled = false;
  }
});
