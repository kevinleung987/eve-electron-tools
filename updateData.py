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
    :param columns: Name of the columns to keep, rest will be pruned to save space
    :param decompress: Decompression function to use
    :returns: None
    """
    sourceFile = sourceName
    tempFile = fileName + '_TEMP'
    os.makedirs(os.path.dirname(downloadsDir + sourceFile), exist_ok=True)
    r = requests.get(baseUrl + sourceFile, allow_redirects=True)
    open(downloadsDir + tempFile, 'wb').write(decompress(r.content))

    df = pandas.read_csv(downloadsDir + tempFile, usecols=columns)
    df.to_csv(downloadsDir + fileName, index=False)
    os.remove(downloadsDir + tempFile)


downloadData('invTypes.csv.bz2', 'invTypes.csv', ['typeID', 'typeName'])
downloadData('mapSolarSystems.csv.bz2', 'mapSolarSystems.csv', ['solarSystemID', 'solarSystemName'])