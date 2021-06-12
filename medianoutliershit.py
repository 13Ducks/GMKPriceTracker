import glob
from parse import parse_prices
import sales
import pandas as pd
import numpy as np





sales = glob.glob("sales/*")
allbase = pd.DataFrame()
first = True
for s in sales:
    print(s)
    df = pd.read_csv(s)
    df["date"] = pd.to_datetime(df["date"])
    #print(df)
    if first:
        allbase = df
        first = False
    else:
        allbase = allbase.append(df)
        
#print(allbase)
grouped = allbase.sort_values(by=['product'])
#grouped.to_csv("sales/grouped.csv")
grouped = grouped.groupby("product")
allBases = pd.DataFrame()
trashBase = pd.DataFrame()
firstAllBase = False
firstshittybase = False
#print(type(grouped))

for name, group in grouped:
    preFilterBase = []
    isFirstBase = True
    for row in group.itertuples():
        if row.category == 'base':
            preFilterBase.append(row)
    unFilteredBase = pd.DataFrame(preFilterBase)
    #print(basesToAdd)
    firstquartile = None
    thirdquartile = None
    iqr = None
    goodBase = []
    shittyassBase = []
    if not unFilteredBase.empty:
        quarts =  list(unFilteredBase['price'].quantile(q = [0.25,0.75]))
        firstquartile = quarts[0]
        thirdquartile = quarts[1]
        iqr = thirdquartile-firstquartile
        print(iqr)
        print(firstquartile)
        print(thirdquartile)
        print('\n')
    if firstquartile and str(firstquartile) != 'nan':
        for index, x in unFilteredBase.iterrows():
            price = x['price']
            if price < (firstquartile - (iqr*1.5)) or price > (thirdquartile + (iqr*1.5)): #adjust the multiplier for greater/less filtering, greater multiplier = more stuff gets filtered
                shittyassBase.append(x)
            else:
                goodBase.append(x)
    if firstAllBase:
        allBases = pd.DataFrame(goodBase)
        firstAllBase = False
    else:
        allBases = allBases.append(goodBase)
    if shittyassBase:
        if firstshittybase:
            trashBase = pd.DataFrame(shittyassBase)
            firstshittybase = False
        else:
            trashBase = trashBase.append(shittyassBase)

allBases.to_csv("allbasesgroupedfilteredMEDIAN.csv")
trashBase.to_csv("shittyassbaseMEDIAN.csv")

def mykey(obj):
    return obj['price']

def iqroutliers(arr):
    arr.sort(key = mykey)
    length = len(arr)
    indexquart1 = int(length/4)
    indexquart3 = length - indexquart1
    iqr = indexquart3-indexquart1
    arr = np.array(arr)
    arr = arr[arr<(indexquart3+1.5*iqr)]
    arr = arr[arr>(indexquart1+1.5*iqr)]
    return arr