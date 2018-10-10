import requests
import os
import bz2
import csv

downloadsDir = 'downloads/'

fileName = 'invTypes.csv.bz2'
url = 'https://www.fuzzwork.co.uk/dump/latest/'+fileName
r = requests.get(url, allow_redirects=True)
os.makedirs(os.path.dirname(downloadsDir+fileName), exist_ok=True)
decompressed = str(bz2.decompress(r.content).decode('utf-8'))
lines = decompressed.split('\n')
labels = lines[0].split(',')
print(labels)
wantedLabels = ['typeID', 'typeName']
wantedIndexes = []
for i in range(len(labels)):
  if labels[i].strip() in wantedLabels:
    wantedIndexes.append(i)
print(wantedIndexes)

items = decompressed.split(',')
print(items[:len(labels)])

# open(downloadsDir+'invTypes.csv', 'wb').write(output)
