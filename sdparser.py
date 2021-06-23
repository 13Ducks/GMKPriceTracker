import glob
from parse import parse_prices
import pandas as pd
import ast
from datetime import datetime
from scipy import stats
import numpy as np
import math

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
    sd = None
    mean = None
    goodBase = []
    shittyassBase = []
    if not unFilteredBase.empty:
        #print(unFilteredBase)
        unFilteredBase.set_index(['date'], inplace=True)
        unFilteredBase = unFilteredBase.sort_index()
        unFilteredBase['RollingMean']=unFilteredBase['price'].rolling('60d', min_periods=0).mean()
        unFilteredBase['RollingSD']=unFilteredBase['price'].rolling('60d', min_periods=0).std()
        mean = unFilteredBase['price'].rolling('60d', min_periods=0).mean()
        sd = unFilteredBase['price'].rolling('60d', min_periods=0).std()
        #sd = unFilteredBase['price'].std(axis=0)
        #mean = unFilteredBase['price'].mean(axis=0)
        #print(mean)
    if not unFilteredBase.empty:
        # print(unFilteredBase['RollingMean'])
        # print(unFilteredBase['RollingSD'])
        # print(sd)
        # print(mean)
        for index, x in unFilteredBase.iterrows():
            print(x)
            print(type(x['RollingSD']))
            z = 0

            if not math.isnan(x['RollingSD']):
                sds = x['RollingSD']
                if sds == 0:
                    sds = 1
                z = (x['price']-x['RollingMean'])/sds
            if z <3:
                print(x.drop(['RollingMean', 'RollingSD'], axis=0))
                goodBase.append(x.drop(['RollingMean', 'RollingSD'], axis=0))
            else:
                shittyassBase.append(x)
                
            
        
            # z = (x['price'] - mean)/sd
            # #print(abs(z))
            # if abs(z) > 2:
            #     shittyassBase.append(x)
            # else:
                #goodBase.append(x)
                

    #print(basesToAdd)
    #basesToAdd[(np.abs(stats.zscore(df[6])) < 3)]
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

allBases.to_csv("newnewnew.csv")
trashBase.to_csv("badbadbad.csv")
    #print(curBases)
    #after math shit and removing outlier

        


    #grouped = df.groupby("product")
    # for name, group in grouped:
    #     for row in group.itertuples():
    #         data = {
    #             u"link": row.link,
    #             u"sets": ast.literal_eval(row.sets),
    #             u"price": row.price,
    #             u"category": row.category,
    #             u"date": row.date,
    #         }
