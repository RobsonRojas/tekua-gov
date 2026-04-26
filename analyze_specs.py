import os
import glob
import json
import re

def parse_md(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

def analyze():
    changes_dir = 'openspec/changes'
    if not os.path.isdir(changes_dir):
        print("Not found")
        return

    features = os.listdir(changes_dir)
    data = {}
    
    for f in features:
        feature_path = os.path.join(changes_dir, f)
        if not os.path.isdir(feature_path): continue
        
        feature_data = {}
        
        # files to read
        files = ['proposal.md', 'design.md', 'tasks.md']
        for file in files:
            f_path = os.path.join(feature_path, file)
            if os.path.isfile(f_path):
                feature_data[file] = parse_md(f_path)
        
        data[f] = feature_data
        
    print(f"Total features parsed: {len(data)}")
    
    # Let's perform some basic checking and output the extracted content
    with open('specs_dump.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    analyze()
