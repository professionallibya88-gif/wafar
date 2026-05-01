import os
import re

# Range covering most emojis and symbols
emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u27bf\u2300-\u23ff]')
found_emojis = []

for root, _, files in os.walk('c:/companyprojectstools/apps'):
    if 'node_modules' in root or 'dist' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith(('.js', '.ts', '.vue', '.html', '.md', '.cjs', '.json', '.txt')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if emoji_pattern.search(content):
                        found_emojis.append(path)
            except Exception as e:
                print(f"Error reading {path}: {e}")

if found_emojis:
    print("Found emojis in:")
    for p in found_emojis:
        print(p)
else:
    print("No emojis found!")
