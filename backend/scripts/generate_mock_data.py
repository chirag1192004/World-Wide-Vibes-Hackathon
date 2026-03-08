import csv
import random
import os
from datetime import datetime, timedelta

def get_random_date(start_year=2014, end_year=2024):
    start = datetime(year=start_year, month=1, day=1)
    end = datetime(year=end_year, month=12, day=31)
    return start + timedelta(days=random.randint(0, (end - start).days))

def main():
    os.makedirs('../data', exist_ok=True)
    
    # 1. Generate Permits
    # lat ~ 32.36, lng ~ -86.29
    permit_types = ['new_commercial', 'remodel_commercial', 'residential_new', 'roofing']
    statuses = ['active', 'expired_closed', 'finaled']
    with open('../data/permits.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['permit_id', 'permit_date', 'lat', 'lng', 'permit_type', 'status', 'business_name'])
        for i in range(1000):
            lat = round(random.uniform(32.32, 32.40), 5)
            lng = round(random.uniform(-86.32, -86.25), 5)
            ptype = random.choice(permit_types)
            status = random.choice(statuses) if 'commercial' in ptype else 'finaled'
            bname = f"Business {i}" if 'commercial' in ptype else ""
            date_str = get_random_date().strftime('%Y-%m-%d')
            # 5% missing lat/lng to test cleaning
            if random.random() < 0.05:
                lat, lng = "", ""
            writer.writerow([f"P-{i}", date_str, lat, lng, ptype, status, bname])

    # 2. Generate Expenditures
    neighborhoods = ['Capitol Heights', 'Downtown', 'East Montgomery', 'West Side', 'Cloverdale']
    with open('../data/expenditures.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['expense_id', 'date', 'neighborhood', 'amount', 'category'])
        for i in range(500):
            date_str = get_random_date(start_year=2021).strftime('%Y-%m-%d')
            writer.writerow([f"E-{i}", date_str, random.choice(neighborhoods), random.randint(1000, 50000), "infrastructure"])

    # 3. Generate Crimes
    with open('../data/crimes.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['incident_id', 'date', 'lat', 'lng', 'type'])
        for i in range(2000):
            lat = round(random.uniform(32.32, 32.40), 5)
            lng = round(random.uniform(-86.32, -86.25), 5)
            date_str = get_random_date(start_year=2023).strftime('%Y-%m-%d')
            writer.writerow([f"C-{i}", date_str, lat, lng, "theft"])

    print("Mock data generated in ../data/")

if __name__ == "__main__":
    main()
