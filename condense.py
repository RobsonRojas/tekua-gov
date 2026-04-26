import json
import re

with open('specs_dump.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

condensed = []
for idx, (feature, docs) in enumerate(data.items(), 1):
    condensed.append(f"### {idx}. {feature}")
    
    proposal = docs.get('proposal.md', '')
    design = docs.get('design.md', '')
    
    # Extract objective from proposal
    obj_match = re.search(r'#.*?\n\n(.*?)\n\n', proposal, re.DOTALL)
    if obj_match:
        obj = obj_match.group(1).replace('\n', ' ').strip()
        condensed.append(f"**Objective:** {obj[:300]}...")
    
    # Extract sections like 'Architecture', 'Data Model', 'Database', 'Dependencies'
    sections_to_check = ['Architecture', 'Database', 'Data Model', 'Dependencies', 'Integration']
    for sec_name in sections_to_check:
        sec_match = re.search(f'(?i)#{sec_name}.*?(#.*|$)', design, re.DOTALL)
        if sec_match:
            sec_text = sec_match.group(0).split('\n', 1)[1].split('#')[0].strip()
            # grab first few lines
            sec_preview = ' '.join(sec_text.split()[:40])
            if sec_preview:
                condensed.append(f"**{sec_name}:** {sec_preview}...")

    condensed.append("")

with open('condensed_analysis.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(condensed))
