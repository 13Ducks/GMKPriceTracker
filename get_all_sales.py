from parse import parse_prices
import pandas as pd
import glob
import os
import numpy as np
files = glob.glob("./datasets/*")
df = pd.DataFrame()
first = True
for f in files:
    data = parse_prices(os.path.basename(f))
    data[0].to_csv("sales/sales_" + os.path.basename(f))
    if first:
        df = data[1]
        first = False
    else:
        df = df.append(data[1])
df.to_csv("sales/grouped.csv")