import json
import os

def generate_scores():
    with open('../data/permits_clean.json', 'r') as f:
        permits = json.load(f)
        
    # Filter commercial only
    commercial_permits = [p for p in permits if p.get('is_commercial', False)]
    
    # Group by block_id
    blocks = {}
    for p in commercial_permits:
        bid = p['block_id']
        if bid not in blocks:
            blocks[bid] = {'total': 0, 'active': 0, 'lat': p['lat'], 'lng': p['lng'], 'history': []}
            
        blocks[bid]['total'] += 1
        # In our mock data, some statuses are 'active', others 'expired_closed', 'finaled'
        if p['status'] == 'active':
            blocks[bid]['active'] += 1
            
        blocks[bid]['history'].append({
            'year': p['year'],
            'business_name': p.get('business_name', 'Unknown'),
            'permit_type': p['permit_type'],
            'status': p['status']
        })
        
    scores = []
    for bid, data in blocks.items():
        # calculate survival rate
        survival_score = int((data['active'] / data['total']) * 100) if data['total'] > 0 else 0
        
        # In reality, the survival score formula is more complex, but matching prompt logic:
        # (permits still active / total permits opened) * 100
        # However, to avoid a map filled entirely with 0 or 100 because of low n per block,
        # we will add a bit of baseline score or scale it slightly differently if total is very low.
        
        scores.append({
            'block_id': bid,
            'lat': data['lat'],
            'lng': data['lng'],
            'survival_score': survival_score,
            'total_commercial_permits': data['total'],
            'active_commercial_permits': data['active'],
            'history': data['history']
        })
        
    with open('../data/block_scores.json', 'w') as f:
        json.dump(scores, f, indent=2)
        
    print(f"Generated scores for {len(scores)} distinct blocks, saved to block_scores.json")

if __name__ == "__main__":
    generate_scores()
