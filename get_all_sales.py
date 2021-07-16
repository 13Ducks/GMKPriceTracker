from parse import parse_prices
import pandas as pd
import glob
import os
import numpy as np

files = glob.glob("./datasets/*")
df = pd.DataFrame()
first = True
for f in files:
    sales, bad_df = parse_prices(os.path.basename(f))
    # sales.to_csv("sales/sales_" + os.path.basename(f))
    df.append(bad_df)

# df = pd.concat(df)
# df.reset_index(inplace=True)
# df.drop(columns=["index"], inplace=True)
# df.to_csv("sales/all_bad.csv")
