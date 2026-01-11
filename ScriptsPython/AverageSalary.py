import json
import os
from collections import defaultdict

def calculate_and_save_stats(input_file_name, output_file_name):
    # 1. Setup paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    input_path = os.path.join(script_dir, '..', input_file_name)
    
    output_path = os.path.join(script_dir, '..', 'data', output_file_name)

    print(f"Reading data from: {os.path.abspath(input_path)}")
    print(f"Writing output to: {os.path.abspath(output_path)}")

    #  Load the data
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find '{input_file_name}' at {input_path}")
        return

    #  Aggregating the data
    stats = defaultdict(lambda: {'count': 0, 'total_salary': 0.0, 'salary_records': 0})

    for entry in data:
        # Getting experience level, default to "Unknown" if missing
        level = entry.get('experience_level') or "Unknown"
        salary = entry.get('salary_eur')

        stats[level]['count'] += 1
        
        if salary is not None:
            stats[level]['total_salary'] += float(salary)
            stats[level]['salary_records'] += 1

    #  Formatting the results
    result = []
    for level, data in stats.items():
        avg_salary = 0
        if data['salary_records'] > 0:
            avg_salary = round(data['total_salary'] / data['salary_records'], 2)
        
        result.append({
            'experience_level': level,
            'count': data['count'],
            'average_salary': avg_salary
        })

    #  Saving the results to the new JSON file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)

    print(f"Success! Processed {len(result)} categories.")
    print(f"Results saved to: {output_path}")

calculate_and_save_stats('ClearOffers2.json', 'ExperienceStats.json')