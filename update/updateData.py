import requests
import os
import bz2
import pandas

downloadsDir = 'downloads/'
baseUrl = 'https://www.fuzzwork.co.uk/dump/latest/'


def downloadData(sourceName, fileName, columns, decompress=bz2.decompress):
    """
    :param sourceName: Name of the file to download, as it appears in the url
    :param fileName: Name of the file, as it will be stored
    :param columns: Name of the columns to keep, use None to keep all columns
    :param decompress: Decompression function to use
    :returns: None
    """
    sourceFile = sourceName
    tempFile = fileName + '_TEMP'
    # Ensure downloads directory exists
    os.makedirs(os.path.dirname(downloadsDir + sourceFile), exist_ok=True)
    # Download the file
    r = requests.get(baseUrl + sourceFile, allow_redirects=True)
    open(downloadsDir + tempFile, 'wb').write(decompress(r.content))
    # Parse the csv file and extract the wanted columns
    df = pandas.read_csv(downloadsDir + tempFile, usecols=columns)
    df.to_csv(downloadsDir + fileName, index=False)
    os.remove(downloadsDir + tempFile)


print('invTypes')
downloadData('invTypes.csv.bz2', 'invTypes.csv',
             ['typeID', 'groupID', 'typeName'])
print('mapSolarSystems')
downloadData('mapSolarSystems.csv.bz2', 'mapSolarSystems.csv',
             ['solarSystemID', 'solarSystemName', 'regionID', 'security'])
print('mapRegions')
downloadData('mapRegions.csv.bz2', 'mapRegions.csv',
             ['regionID', 'regionName'])
print('invGroups')
downloadData('invGroups.csv.bz2', 'invGroups.csv',
             ['groupID', 'groupName'])
print('mapSolarSystemJumps')
downloadData('mapSolarSystemJumps.csv.bz2', 'mapSolarSystemJumps.csv',
             ['fromSolarSystemID', 'toSolarSystemID'])
