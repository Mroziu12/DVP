import json
import os
import statistics
from collections import defaultdict


def analyze_skills_data():
    # 1. Setup Paths
    # Script location: .../job-market-page/scripts/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Input: Go 2 folders up to find ClearOffers.json 
    # (based on your previous structure)
    # If ClearOffers is actually inside 'data', 
    # change this to: os.path.join
    # (script_dir, '..', 'data', 'ClearOffers.json')
    input_path = os.path.join(script_dir, '..', 'ClearOffers2.json')
    
    # OUTPUT CHANGED HERE:
    # Go UP one level (to job-market-page), then DOWN into 'data'
    output_json = os.path.join(script_dir, '..', 'data', 'SkillVsSalary.json')

    print(f"Reading data from: {os.path.abspath(input_path)}")
    print(f"Writing output to: {os.path.abspath(output_json)}")

    # 2. Load Data
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find input file at {input_path}")
        return

    # 3. Process Data
    skill_data = defaultdict(lambda: {'levels': [], 'salaries': []})

    for offer in data:
        salary = offer.get('salary_eur')
        skills = offer.get('skills') or []

        for skill in skills:
            name = skill.get('original_name')
            level = skill.get('level')

            if name and isinstance(level, (int, float)):
                skill_data[name]['levels'].append(level)
                if salary is not None:
                    skill_data[name]['salaries'].append(float(salary))

    # 4. Calculate Averages
    results = []
    MIN_OFFERS = 10

    for name, stats in skill_data.items():
        if len(stats['salaries']) >= MIN_OFFERS:
            avg_level = statistics.mean(stats['levels'])
            avg_salary = statistics.mean(stats['salaries'])
            
            results.append({
                'skill': name,
                'avg_level': round(avg_level, 2),
                'avg_salary': round(avg_salary, 0),
                'count': len(stats['salaries'])
            })

    # 5. Save processed data
    # Ensure the 'data' directory exists before writing to it
    os.makedirs(os.path.dirname(output_json), exist_ok=True)

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"Success! Processed {len(results)} skills.")
    print(f"JSON saved to: {output_json}")


if __name__ == "__main__":
    analyze_skills_data()