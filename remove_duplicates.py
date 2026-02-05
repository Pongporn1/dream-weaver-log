"""
Remove duplicate particle implementations from particleEffects.ts

This script removes the implementations of 9 completed particles,
keeping only the re-export statements at the top
"""
import re

# Read the file
with open('src/utils/particleEffects.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Define functions to remove (keep interfaces, remove implementations)
# Format: (start_pattern, end_pattern_or_next_export)
removals = [
    # MoonFlash - lines 302-342
    (r'\nexport const initMoonFlashes = \(\) => \[\];', r'\nexport const initOrbitingParticles'),

   # OrbitingParticle - lines 344-390
    (r'\nexport const initOrbitingParticles = \(', r'\nexport const initSparkles'),

    # Sparkle - lines 392-540
    (r'\nexport const initSparkles = \(', r'\nexport const initAuroraWaves'),

    # AuroraWave - lines 542-694
    (r'\nexport const initAuroraWaves = \(canvasHeight: number\): AuroraWave', r'\nexport const initFireflies'),

    # Firefly - lines 697-752
    (r'\nexport const initFireflies = \(', r'\nexport const initSnowflakes'),

    # Snowflake - lines 756-808
    (r'\nexport const initSnowflakes = \(', r'\nexport const initFogLayers'),

    # FogLayer - lines 812-919
    (r'\nexport const initFogLayers = \(', r'\n// =================== SHATTERED MOON ==================='),

    # EchoMoon - lines 2028-2155
    (r'\nexport const initEchoMoons = \(', r'\n// =================== LEGENDARY EFFECTS ==================='),

    # BloodRing - lines 2162-2189
    (r'\nexport const initBloodRings = \(moonRadius: number\): BloodRing', r'\n// Fade Particles Effect'),
]

modified_content = content

for start_pattern, end_pattern in removals:
    # Find start position
    start_match = re.search(start_pattern, modified_content)
    if start_match:
        start_pos = start_match.start()
        # Find end position
        end_match = re.search(end_pattern, modified_content[start_pos:])
        if end_match:
            end_pos = start_pos + end_match.start()
            # Remove the section
            modified_content = modified_content[:start_pos] + modified_content[end_pos:]
            print(f"Removed: {start_pattern[:50]}...")

# Write back
with open('src/utils/particleEffects.ts', 'w', encoding='utf-8') as f:
    f.write(modified_content)

print("Done! Removed 9 duplicate implementations")
