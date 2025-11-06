import pandas as pd
import requests
from bs4 import BeautifulSoup
from pathlib import Path

# Fetch the webpage
url = 'https://wiki.dominionstrategy.com/index.php/List_of_cards'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Find the wikitable
table = soup.find('table', class_='wikitable')

# Get headers
headers = []
for th in table.find('tr').find_all('th'):
    headers.append(th.text.strip())

# Get rows
rows = []
for tr in table.find_all('tr')[1:]:  # Skip header row
    row = []
    for td in tr.find_all('td'):
        # Special handling for cost column (it's the 4th column, index 3)
        if len(row) == 3 and 'data-sort-value' in td.attrs:
            value = td.get('data-sort-value')
        else:
            value = td.text.strip()
        row.append(value)
    if row:  # Skip empty rows
        rows.append(row)

# Create DataFrame
df = pd.DataFrame(rows, columns=headers)

# First rename columns with ' / ' to use only the text before the slash
new_columns = {col: col.split(' / ')[0] for col in df.columns if ' / ' in col}
df = df.rename(columns=new_columns)

# Then simplify any remaining column names with spaces to just the first word
new_columns = {col: col.split()[0] for col in df.columns if ' ' in col}
df = df.rename(columns=new_columns)

# Save to CSV
project_root = Path(__file__).parent.parent
df.to_csv(project_root / 'src' / 'lib' / 'data' / 'cards.csv', index=False)
