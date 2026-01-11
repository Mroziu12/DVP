import json
import os
from collections import defaultdict

def analyze_categories():
    #  Setup paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, '..', 'ClearOffers2.json')
    output_path = os.path.join(script_dir, '..', 'data', 'CategoryStats.json')

    print(f"Reading data from: {os.path.abspath(input_path)}")

    # Load Data
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find input file.")
        return

    #  Aggregate Data
    stats = defaultdict(lambda: {'count': 0, 'salary_sum': 0.0, 'salary_records': 0})

    for entry in data:

        cat = entry.get('marker_icon') or entry.get('category') or 'Other'
        cat = cat.capitalize()

        stats[cat]['count'] += 1
        
        salary = entry.get('salary_eur')
        if salary is not None:
            stats[cat]['salary_sum'] += float(salary)
            stats[cat]['salary_records'] += 1

    # Process Results
    results = []
    for cat, data in stats.items():
        avg_salary = 0
        if data['salary_records'] > 0:
            avg_salary = round(data['salary_sum'] / data['salary_records'], 0)

        results.append({
            'category': cat,
            'count': data['count'],
            'avg_salary': avg_salary
        })

    # Sort by Count (Most popular first)
    results.sort(key=lambda x: x['count'], reverse=True)

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print(f"Success! Processed {len(results)} categories.")
    print(f"Saved to: {output_path}")

if __name__ == "__main__":
    analyze_categories()