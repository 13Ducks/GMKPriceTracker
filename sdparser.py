import glob
import pandas as pd

MIN_Z_SCORE = 2.5

sales = glob.glob("sales/sales_*")

all_df = pd.concat([pd.read_csv(file) for file in sales])
all_df["date"] = pd.to_datetime(all_df["date"])
grouped = all_df.groupby("product")

good_base = []
bad_base = []

for name, group in grouped:
    grouped_category = group.groupby("category")
    for c, category_df in grouped_category:
        category_df.set_index(["date"], inplace=True)
        category_df.sort_index(inplace=True)
        category_df["rolling_mean"] = (
            category_df["price"].rolling("90d", min_periods=0).mean()
        )
        category_df["rolling_sd"] = (
            category_df["price"].rolling("90d", min_periods=0).std()
        )

        category_df.set_index(["Unnamed: 0"], inplace=True)

        category_df["rolling_sd"].fillna(0, inplace=True)
        category_df["rolling_sd"].replace(0, 1, inplace=True)
        category_df["z_score"] = (
            (category_df["price"] - category_df["rolling_mean"])
            / category_df["rolling_sd"]
        ).abs()

        good_base.append(category_df[category_df["z_score"] < MIN_Z_SCORE])
        bad_base.append(category_df[category_df["z_score"] >= MIN_Z_SCORE])

good_base = pd.concat(good_base)
bad_base = pd.concat(bad_base)

good_base.to_csv("good_bases_c2.csv")
bad_base.to_csv("bad_bases_c2.csv")