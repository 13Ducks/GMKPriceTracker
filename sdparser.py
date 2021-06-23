import glob
import pandas as pd

MIN_Z_SCORE = 3

sales = glob.glob("sales/*")

all_df = pd.concat([pd.read_csv(file) for file in sales])
all_df["date"] = pd.to_datetime(all_df["date"])
grouped = all_df.groupby("product")

good_base = []
bad_base = []

for name, group in grouped:
    base_df = group[group["category"] == "base"]
    base_df.set_index(["date"], inplace=True)
    base_df.sort_index(inplace=True)
    base_df["rolling_mean"] = base_df["price"].rolling("90d", min_periods=0).mean()
    base_df["rolling_sd"] = base_df["price"].rolling("90d", min_periods=0).std()

    base_df["rolling_sd"].fillna(0, inplace=True)
    base_df["rolling_sd"].replace(0, 1, inplace=True)
    base_df["z_score"] = (
        (base_df["price"] - base_df["rolling_mean"]) / base_df["rolling_sd"]
    ).abs()

    good_base.append(base_df[base_df["z_score"] < MIN_Z_SCORE])
    bad_base.append(base_df[base_df["z_score"] >= MIN_Z_SCORE])

good_base = pd.concat(good_base)
bad_base = pd.concat(bad_base)

good_base.to_csv("goodv1.csv")
bad_base.to_csv("badv1.csv")