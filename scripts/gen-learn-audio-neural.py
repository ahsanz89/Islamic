"""Builds the lesson recordings with a neural Arabic voice (Piper "kareem", ar_JO), which sounds far more natural than eSpeak.
Run: node scripts/learn-texts.mjs > texts.json
     python3 scripts/gen-learn-audio-neural.py texts.json public/learn-audio <model-folder>
Needs: pip install piper-tts ; ffmpeg ; the model from
https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ar_JO-kareem-medium.tar.bz2"""
import json, os, subprocess, sys, wave
from piper import PiperVoice, SynthesisConfig
src, out, md = sys.argv[1], sys.argv[2], sys.argv[3]
v = PiperVoice.load(f'{md}/ar_JO-kareem-medium.onnx', config_path=f'{md}/ar_JO-kareem-medium.onnx.json')
cfg = SynthesisConfig(length_scale=1.45, noise_scale=0.5, noise_w_scale=0.6)
os.makedirs(out, exist_ok=True)
keys = []
for it in json.load(open(src)):
    wav = f"/tmp/{it['k']}.wav"
    with wave.open(wav, 'wb') as w: v.synthesize_wav(it['t'] + '.', w, syn_config=cfg)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.15',
                    '-ar', '22050', '-ac', '1', '-b:a', '48k', os.path.join(out, it['k'] + '.mp3')], check=True)
    os.remove(wav); keys.append(it['k'])
json.dump(sorted(keys), open(os.path.join(out, 'manifest.json'), 'w'))
print(len(keys), 'files')
