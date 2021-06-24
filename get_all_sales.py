from parse import parse_prices
import pandas as pd
import glob
import os

files = glob.glob("./datasets/*")
df = []

for f in files:
    sales, low_base = parse_prices(os.path.basename(f))
    sales.to_csv("sales/sales_" + os.path.basename(f))
    df.append(low_base)

df = pd.concat(df)
df.to_csv("sales/all_low_base.csv")