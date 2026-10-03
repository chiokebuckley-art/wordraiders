#!/usr/bin/env python3
"""
Free Automated Voiceover Generator for Code Video Assets
-------------------------------------------------------
This script extracts narration voiceover text from the markdown video production
assets and automatically generates audio files (.mp3) and subtitle files (.vtt/.srt).

100% FREE - TWO MODES:
1. (Recommended) Edge-TTS: Ultra-realistic neural speech (Azure Neural backend).
   Requires: pip install edge-tts
   No account, no API key, zero cost.
2. Fallback: Native macOS 'say' command with afconvert.
   Zero installs required.
"""

import os
import re
import sys
import asyncio
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
AUDIO_OUT_DIR = BASE_DIR / "audio_voiceovers"
AUDIO_OUT_DIR.mkdir(exist_ok=True)

# Recommended Free Neural Voices:
# - 'en-US-ChristopherNeural' (Deep, authoritative documentary tone)
# - 'en-US-GuyNeural' (Natural, warm conversational narrator)
# - 'en-GB-RyanNeural' (Clear, crisp British documentary tone)
# - 'en-US-JennyNeural' (Engaging, professional female narrator)
DEFAULT_VOICE = "en-US-ChristopherNeural"

FEATURES = [
    {
        "id": "feature_1_knights_deduction",
        "file": "feature_explanation_1_knights_deduction_engine.md",
        "title": "Knights & Knaves Deduction Engine",
        "voice": "en-US-ChristopherNeural",
    },
    {
        "id": "feature_2_grid_matrix",
        "file": "feature_explanation_2_grid_constraint_matrix.md",
        "title": "Grid Detective Constraint Elimination Matrix",
        "voice": "en-US-GuyNeural",
    },
    {
        "id": "feature_3_hemostatic_wound",
        "file": "feature_explanation_3_hemostatic_wound_simulation.md",
        "title": "Med Quest Hemostatic Simulation & Tissue Repair",
        "voice": "en-GB-RyanNeural",
    },
    {
        "id": "feature_4_wordraiders_crdt",
        "file": "feature_explanation_4_wordraiders_crdt_sync.md",
        "title": "WordRaiders Distributed CRDT Journey Consensus",
        "voice": "en-US-ChristopherNeural",
    },
    {
        "id": "intro_trailer_hardlight_heist",
        "file": "intro_video_concept_3_hardlight_heist.md",
        "title": "WordRaiders Conquer The Journey (Hard-Light Heist Trailer)",
        "voice": "en-US-GuyNeural",
    },
]


def extract_narration_script(markdown_path: Path) -> str:
    """Extract clean voiceover text from the narration script block in markdown."""
    text = markdown_path.read_text(encoding="utf-8")
    
    # Locate the Script section between ``` code fence
    match = re.search(r"(?:### 1\.2 Full Narration Script|## 1\. Complete Trailer Script).*?```(?:\w+)?\n(.*?)```", text, re.DOTALL)
    if not match:
        # Fallback: grab the first triple backtick code fence with VO
        match = re.search(r"```(?:\w+)?\n(\[0:00.*?Voiceover.*?)```", text, re.DOTALL)
        if not match:
            raise ValueError(f"Could not locate narration script section in {markdown_path.name}")
    
    raw_script = match.group(1)
    
    clean_lines = []
    in_vo = False
    
    for line in raw_script.splitlines():
        line_str = line.strip()
        
        # Skip visual cues, sound FX, and timestamp headers
        if any(line_str.startswith(prefix) for prefix in ["[Visual Cue:", "[Visual:", "[Audio:", "[Sound FX:", "Audio:", "Visual:", "[0:", "[1:"]):
            in_vo = False
            continue
            
        if line_str.startswith("Voiceover (VO)") or line_str.startswith("VO:") or line_str.startswith("VO ("):
            in_vo = True
            continue
            
        if in_vo:
            # Strip enclosing quotation marks if present
            cleaned = line_str.strip('"').strip("'")
            if cleaned:
                clean_lines.append(cleaned)
                
    return " ".join(clean_lines)


async def generate_with_edge_tts(text: str, voice: str, output_mp3: Path, output_srt: Path) -> bool:
    """Generate audio and subtitles using edge-tts (free Microsoft Neural TTS)."""
    try:
        import edge_tts
    except ImportError:
        return False
        
    print(f"🎙️  Synthesizing with Neural Voice [{voice}]...")
    communicate = edge_tts.Communicate(text, voice)
    submaker = edge_tts.SubMaker()
    
    with open(output_mp3, "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.feed(chunk)
                
    # Write SRT subtitles with exact word-level timing
    with open(output_srt, "w", encoding="utf-8") as srt_file:
        srt_file.write(submaker.get_srt())
        
    return True


def generate_with_macos_say(text: str, output_mp3: Path) -> bool:
    """Generate audio using macOS built-in 'say' tool and convert to mp3."""
    temp_aiff = output_mp3.with_suffix(".aiff")
    print(f"📢 Synthesizing with macOS native speech...")
    
    # Run macOS say to create AIFF
    res = subprocess.run(["say", "-o", str(temp_aiff), text], capture_output=True)
    if res.returncode != 0:
        print(f"Error running say: {res.stderr.decode()}")
        return False
        
    # Convert AIFF to AAC/M4A or MP3 using afconvert (native macOS audio converter)
    temp_m4a = output_mp3.with_suffix(".m4a")
    conv_res = subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", str(temp_aiff), str(temp_m4a)], capture_output=True)
    
    if temp_aiff.exists():
        temp_aiff.unlink()
        
    if conv_res.returncode == 0 and temp_m4a.exists():
        print(f"✅ Generated macOS native audio: {temp_m4a.name}")
        return True
    return False


async def process_all():
    print("=" * 65)
    print("🎬 Code Video Assets - Free Automated Voiceover Generator")
    print("=" * 65)
    
    # Check if edge-tts is available
    has_edge_tts = False
    try:
        import edge_tts
        has_edge_tts = True
    except ImportError:
        print("\nℹ️  Notice: 'edge-tts' library is not yet installed.")
        print("   To enable ultra-realistic AI neural voices at 0 cost, run:")
        print("     pip install edge-tts\n")
        print("   Falling back to macOS native speech engine for now...\n")

    for feat in FEATURES:
        md_path = BASE_DIR / feat["file"]
        if not md_path.exists():
            print(f"⚠️  Missing file: {md_path.name}")
            continue
            
        print(f"\n▶ Processing: {feat['title']}")
        narration_text = extract_narration_script(md_path)
        print(f"📝 Extracted script: {len(narration_text.split())} words")
        
        mp3_path = AUDIO_OUT_DIR / f"{feat['id']}.mp3"
        srt_path = AUDIO_OUT_DIR / f"{feat['id']}.srt"
        
        success = False
        if has_edge_tts:
            success = await generate_with_edge_tts(narration_text, feat["voice"], mp3_path, srt_path)
            if success:
                print(f"✅ Neural Voiceover: {mp3_path.name}")
                print(f"📄 Subtitle Track:  {srt_path.name}")
                
        if not success:
            generate_with_macos_say(narration_text, mp3_path)
            
    print("\n" + "=" * 65)
    print(f"🎉 Complete! All audio files saved in: {AUDIO_OUT_DIR}")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(process_all())
