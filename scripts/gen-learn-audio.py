"""Builds the lesson recordings (public/learn-audio/*.mp3 + manifest.json) with the free eSpeak-NG Arabic voice.
Run: node scripts/learn-texts.mjs > texts.json ; python3 scripts/gen-learn-audio.py texts.json public/learn-audio
Needs: pip install espeakng-loader ; ffmpeg. Real teacher recordings can replace any file with the same name."""
import ctypes, json, os, subprocess, sys, wave
import espeakng_loader as e
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lib = ctypes.CDLL(e.get_library_path())
CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
buf = []
def cb(w, n, ev):
    if w and n > 0: buf.append(ctypes.string_at(w, n * 2))
    return 0
_cb = CB(cb)
sr = lib.espeak_Initialize(2, 0, e.get_data_path().encode(), 0)
lib.espeak_SetSynthCallback(_cb)
lib.espeak_SetVoiceByName(b"ar")
lib.espeak_SetParameter(1, 105, 0)
keys = []
for it in json.load(open(src)):
    buf.clear()
    b = it['t'].encode()
    lib.espeak_Synth(b, len(b) + 1, 0, 0, 0, 1, None, None)
    lib.espeak_Synchronize()
    pcm = b''.join(buf)
    if len(pcm) < 2000: print('EMPTY', it); continue
    wav = os.path.join('/tmp', it['k'] + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.1',
                    '-ar', '22050', '-ac', '1', '-b:a', '40k', os.path.join(out, it['k'] + '.mp3')], check=True)
    os.remove(wav)
    keys.append(it['k'])
json.dump(sorted(keys), open(os.path.join(out, 'manifest.json'), 'w'))
print(len(keys), 'files')
