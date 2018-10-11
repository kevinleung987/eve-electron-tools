import requests
import os
import bz2
import pandas

downloadsDir = 'downloads/'
baseUrl = 'https://www.fuzzwork.co.uk/dump/latest/'


def downloadData(fileName, columns):
    os.makedirs(os.path.dirname(downloadsDir +
                                fileName + '.bz2'), exist_ok=True)
    r = requests.get(baseUrl + fileName + '.bz2', allow_redirects=True)
    open(downloadsDir + fileName + '.FULL',
         'wb').write(bz2.decompress(r.content))

    df = pandas.read_csv(downloadsDir + fileName + '.FULL', usecols=columns)
    df.to_csv(downloadsDir + fileName, index=False)
    os.remove(downloadsDir + fileName + '.FULL')


downloadData('invTypes.csv', ['typeID', 'typeName'])
