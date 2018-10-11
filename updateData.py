import requests
import os
import bz2
import pandas

downloadsDir = 'downloads/'
baseUrl = 'https://www.fuzzwork.co.uk/dump/latest/'


def downloadData(fileName, columns, ext='.bz2', decompress=bz2.decompress):
    sourceFile = fileName + ext
    tempFile = fileName + '_TEMP'
    os.makedirs(os.path.dirname(downloadsDir + sourceFile), exist_ok=True)
    r = requests.get(baseUrl + sourceFile, allow_redirects=True)
    open(downloadsDir + tempFile, 'wb').write(decompress(r.content))

    df = pandas.read_csv(downloadsDir + tempFile, usecols=columns)
    df.to_csv(downloadsDir + fileName, index=False)
    os.remove(downloadsDir + tempFile)


downloadData('invTypes.csv', ['typeID', 'typeName'])
