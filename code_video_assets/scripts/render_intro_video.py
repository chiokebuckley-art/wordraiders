import sys, os, subprocess, random, math
from collections import deque

FFMPEG = "/tmp/ffmpeg"
WORKSPACE = "/Users/chiokebuckleymini/Desktop/Antigravity code/Apps/wordraiders"
SPRITESHEET_PATH = "/Users/chiokebuckleymini/.gemini/antigravity/brain/9caef008-9fdd-4d5c-885e-62319ce8f21d/wordraider_run_spritesheet_1790990786895.jpg"
BG_PATH = os.path.join(WORKSPACE, "code_video_assets/keyframes/wordraider_cyber_city_bg.jpg")
AUDIO_PATH = os.path.join(WORKSPACE, "code_video_assets/audio_voiceovers/intro_trailer_hardlight_heist.mp3")
OUTPUT_MP4 = os.path.join(WORKSPACE, "code_video_assets/wordraiders_intro_cinematic.mp4")

print(f"Reading sprite sheet from {SPRITESHEET_PATH}...")
cmd_sheet = [FFMPEG, "-y", "-i", SPRITESHEET_PATH, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
p = subprocess.Popen(cmd_sheet, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
sheet_bytes = p.stdout.read()
sheet_w, sheet_h = 1376, 768

print("Extracting 6 running animation frames with flood-fill alpha masking...")
splits = [
    (8, 260),
    (260, 465),
    (465, 690),
    (690, 895),
    (895, 1160),
    (1160, 1345)
]

sprite_w, sprite_h = 320, 440
sprites_rgba = []

for idx, (x_start, x_end) in enumerate(splits):
    cw = x_end - x_start
    rgba = bytearray(sprite_w * sprite_h * 4)
    sheet_y_start = 135
    sheet_y_end = 555
    x_dest_offset = (sprite_w - cw) // 2
    
    for sy in range(sheet_y_start, min(sheet_h, sheet_y_end)):
        dy = sy - sheet_y_start
        if dy >= sprite_h: break
        for sx in range(x_start, x_end):
            dx = x_dest_offset + (sx - x_start)
            if 0 <= dx < sprite_w:
                s_idx = (sy * sheet_w + sx) * 3
                d_idx = (dy * sprite_w + dx) * 4
                r = sheet_bytes[s_idx]
                g = sheet_bytes[s_idx+1]
                b = sheet_bytes[s_idx+2]
                rgba[d_idx] = r
                rgba[d_idx+1] = g
                rgba[d_idx+2] = b
                rgba[d_idx+3] = 0 if (r <= 12 and g <= 12 and b <= 12) else 255
                
    # Flood-fill external background
    visited = [False] * (sprite_w * sprite_h)
    q = deque()
    for x in range(sprite_w):
        q.append((x, 0))
        q.append((x, sprite_h - 1))
    for y in range(sprite_h):
        q.append((0, y))
        q.append((sprite_w - 1, y))
        
    while q:
        cx, cy = q.popleft()
        pos = cy * sprite_w + cx
        if visited[pos]: continue
        visited[pos] = True
        idx = pos * 4
        r, g, b = rgba[idx], rgba[idx+1], rgba[idx+2]
        if r <= 22 and g <= 22 and b <= 22:
            rgba[idx+3] = 0
            for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)]:
                if 0 <= nx < sprite_w and 0 <= ny < sprite_h:
                    if not visited[ny * sprite_w + nx]:
                        q.append((nx, ny))
                        
    sprites_rgba.append(rgba)

print(f"Extracted {len(sprites_rgba)} clean frames.")

# Render settings
out_w, out_h = 1280, 720
fps = 30
duration_sec = 27.5
total_frames = int(fps * duration_sec)

# Read background at 1440x720 so we can smoothly pan it horizontally
bg_pan_w, bg_pan_h = 1440, 720
print(f"Reading background at {bg_pan_w}x{bg_pan_h}...")
cmd_bg = [FFMPEG, "-y", "-i", BG_PATH, "-s", f"{bg_pan_w}x{bg_pan_h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
p_bg = subprocess.Popen(cmd_bg, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
bg_bytes = p_bg.stdout.read()

# Setup speed lines particles
speed_lines = []
for i in range(12):
    speed_lines.append({
        'x': random.randint(0, out_w),
        'y': random.randint(120, out_h - 100),
        'speed': random.randint(22, 38),
        'length': random.randint(80, 180),
        'color': (0, 229, 255) if random.random() > 0.4 else (255, 0, 127)
    })

# Footstep impact shockwaves
shockwaves = []

# Floating Lexicon Glyph particles
glyphs = []
GLYPH_CHARS = ["W", "O", "R", "D", "R", "A", "I", "D", "E", "R", "S"]
for i in range(15):
    glyphs.append({
        'x': random.randint(400, out_w - 200),
        'y': random.randint(240, 520),
        'vx': random.uniform(-4, -9),
        'vy': random.uniform(-1, 1),
        'size': random.randint(10, 18),
        'life': random.uniform(0.2, 1.0),
        'char': random.choice(GLYPH_CHARS),
        'color': (0, 229, 255) if random.random() > 0.3 else (255, 215, 0)
    })

print(f"Launching FFmpeg encoder to produce {OUTPUT_MP4} ({total_frames} frames)...")
ffmpeg_cmd = [
    FFMPEG, "-y",
    "-f", "rawvideo", "-vcodec", "rawvideo",
    "-s", f"{out_w}x{out_h}", "-pix_fmt", "rgb24", "-r", str(fps),
    "-i", "-",
    "-i", AUDIO_PATH,
    "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    "-movflags", "+faststart",
    OUTPUT_MP4
]

p_out = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

# Precalculate ground positions and bounce for the 6 frames
# Char 0: ground
# Char 1: down/recoil
# Char 2: pass
# Char 3: push
# Char 4: high air
# Char 5: landing
bounce_table = [0, 4, -4, -10, -20, 2]

# Runner base position
rx = 640
ry_base = 240

for frame_idx in range(total_frames):
    t = frame_idx / fps
    
    # 1. Background Camera Panning (subtle back-and-forth cinematic tracking)
    # pan_offset between 0 and 160 (bg_pan_w - out_w)
    pan_offset = int(80 + 70 * math.sin(t * 0.4))
    
    # Crop 1280x720 window from 1440x720 bg
    frame = bytearray(out_w * out_h * 3)
    for y in range(out_h):
        src_row = y * bg_pan_w * 3
        dst_row = y * out_w * 3
        src_start = src_row + pan_offset * 3
        src_end = src_start + out_w * 3
        frame[dst_row:dst_row + out_w * 3] = bg_bytes[src_start:src_end]
        
    # 2. Update and draw speed lines
    for line in speed_lines:
        line['x'] -= line['speed']
        if line['x'] < -line['length']:
            line['x'] = out_w + random.randint(20, 200)
            line['y'] = random.randint(100, out_h - 80)
            line['speed'] = random.randint(24, 42)
            
        lx = int(line['x'])
        ly = int(line['y'])
        length = line['length']
        lr, lg, lb = line['color']
        
        if 0 <= ly < out_h:
            row_idx = ly * out_w * 3
            for step in range(length):
                px = lx + step
                if 0 <= px < out_w:
                    intensity = (1.0 - abs(step - length * 0.5) / (length * 0.5)) * 0.7
                    idx = row_idx + px * 3
                    frame[idx] = min(255, int(frame[idx] + lr * intensity))
                    frame[idx+1] = min(255, int(frame[idx+1] + lg * intensity))
                    frame[idx+2] = min(255, int(frame[idx+2] + lb * intensity))

    # 3. Running Character Animation Cycle
    # Cycle 6 frames at ~11.5 fps -> ~2.6 video frames per sprite
    cycle_idx = int(frame_idx / 2.6) % 6
    spr = sprites_rgba[cycle_idx]
    ry = ry_base + bounce_table[cycle_idx]
    
    # Trigger shockwave at foot impact (frames 1 and 5)
    if cycle_idx in [1, 5] and (int(frame_idx / 2.6) != int((frame_idx - 1) / 2.6)):
        shockwaves.append({
            'x': rx + 160 + (40 if cycle_idx == 1 else -20),
            'y': ry_base + 380,
            'radius': 6,
            'max_radius': 60,
            'alpha': 1.0,
            'color': (0, 229, 255) if cycle_idx == 1 else (255, 0, 127)
        })
        
    # Draw shockwaves
    active_shockwaves = []
    for sw in shockwaves:
        sw['radius'] += 3.5
        sw['alpha'] -= 0.06
        if sw['alpha'] > 0 and sw['radius'] < sw['max_radius']:
            active_shockwaves.append(sw)
            cx, cy = int(sw['x']), int(sw['y'])
            r = int(sw['radius'])
            cr, cg, cb = sw['color']
            alpha = max(0.0, sw['alpha'])
            
            # Draw ellipse on the ground (flattened 2:1 for perspective)
            for deg in range(0, 360, 4):
                rad = math.radians(deg)
                px = int(cx + r * math.cos(rad))
                py = int(cy + (r * 0.45) * math.sin(rad))
                if 0 <= px < out_w and 0 <= py < out_h:
                    idx = (py * out_w + px) * 3
                    frame[idx] = min(255, int(frame[idx] + cr * alpha * 0.8))
                    frame[idx+1] = min(255, int(frame[idx+1] + cg * alpha * 0.8))
                    frame[idx+2] = min(255, int(frame[idx+2] + cb * alpha * 0.8))
    shockwaves = active_shockwaves
    
    # 4. Draw Runner Character onto Frame
    for sy in range(sprite_h):
        fy = ry + sy
        if fy < 0 or fy >= out_h: continue
        f_row = fy * out_w * 3
        s_row = sy * sprite_w * 4
        for sx in range(sprite_w):
            fx = rx + sx
            if fx < 0 or fx >= out_w: continue
            
            s_idx = s_row + sx * 4
            a = spr[s_idx+3]
            if a == 0: continue
            
            sr = spr[s_idx]
            sg = spr[s_idx+1]
            sb = spr[s_idx+2]
            f_idx = f_row + fx * 3
            
            frame[f_idx] = sr
            frame[f_idx+1] = sg
            frame[f_idx+2] = sb

    # 5. Draw Cinematic Letterbox Bars
    bar_h = 24
    for y in range(bar_h):
        idx_top = y * out_w * 3
        idx_bot = (out_h - 1 - y) * out_w * 3
        for x in range(out_w * 3):
            frame[idx_top + x] = 0
            frame[idx_bot + x] = 0
            
    p_out.stdin.write(frame)
    if frame_idx % 90 == 0:
        pct = int(frame_idx / total_frames * 100)
        print(f"Render progress: {pct}% ({frame_idx}/{total_frames} frames)")

p_out.stdin.close()
p_out.wait()
print(f"Production video successfully rendered to {OUTPUT_MP4}!")
