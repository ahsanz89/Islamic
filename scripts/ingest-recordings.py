"""Turns the tutor's recordings (zip from public/recorder) into the app's lesson sounds.
Run: python3 scripts/ingest-recordings.py dalil-tutor-recordings.zip
Converts each clip to a trimmed, level-matched MP3 and replaces the same-named file for the website and the app."""
import os, shutil, subprocess, sys, tempfile, zipfile
zf = sys.argv[1]
targets = [d for d in ('public/learn-audio', 'mobile/assets/learn-audio') if os.path.isdir(d)]
n = 0
with tempfile.TemporaryDirectory() as tmp:
    zipfile.ZipFile(zf).extractall(tmp)
    for f in sorted(os.listdir(tmp)):
        key = os.path.splitext(f)[0]
        if not key.startswith('t'): continue
        out = os.path.join(targets[0], key + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(tmp, f), '-af',
                        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.1',
                        '-ar', '22050', '-ac', '1', '-b:a', '48k', out], check=True)
        for t in targets[1:]: shutil.copy(out, os.path.join(t, key + '.mp3'))
        n += 1
print(n, 'recordings installed')
