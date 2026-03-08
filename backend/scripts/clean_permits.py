import pandas as pd
import json
import os

def clean_permits():
    df = pd.read_csv('../data/permits.csv')
    
    # Drop rows missing lat, lng, or date
    df = df.dropna(subset=['lat', 'lng', 'permit_date'])
    
    # Parse permit_date
    df['permit_date'] = pd.to_datetime(df['permit_date'])
    df['year'] = df['permit_date'].dt.year
    df['month'] = df['permit_date'].dt.month
    
    # Add block_id
    df['block_id'] = df.apply(lambda row: f"{round(row['lat'], 3)}_{round(row['lng'], 3)}", axis=1)
    
    # Add is_commercial
    valid_types = ['commercial', 'business']
    df['is_commercial'] = df['permit_type'].apply(
        lambda x: any(t in str(x).lower() for t in valid_types)
    )
    
    # Convert dates to string for JSON serialization
    df['permit_date'] = df['permit_date'].astype(str)
    
    # Export cleaned JSON
    records = df.to_dict(orient='records')
    with open('../data/permits_clean.json', 'w') as f:
        json.dump(records, f, indent=2)
        
    print(f"Cleaned {len(records)} permits, saved to permits_clean.json")

if __name__ == "__main__":
    clean_permits()
