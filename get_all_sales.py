from parse import parse_prices
import glob
import os

files = glob.glob("./datasets/*")
for f in files:
    sales_df = parse_prices(os.path.basename(f))
    sales_df.to_csv("sales/sales_" + os.path.basename(f))
