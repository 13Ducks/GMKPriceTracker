import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import ast

cred = credentials.Certificate("./firebaseAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

passed_df = pd.read_csv("./sales/passed_sd_check.csv")
all_bad_df = pd.read_csv("./sales/all_bad.csv")
failed_df = pd.read_csv("./sales/failed_sd_check.csv")

with open("./manual_filter/all_bad.txt", "r") as f:
    l = list(map(int, f.read().split(" ")))
    passed_df = passed_df.append(all_bad_df.iloc[l])

with open("./manual_filter/bad_sd.txt", "r") as f:
    l = list(map(int, f.read().split(" ")))
    passed_df = passed_df.append(failed_df.iloc[l])


passed_df["date"] = pd.to_datetime(passed_df["date"])

grouped = passed_df.groupby("product")
for name, group in grouped:
    print(name)
    doc = db.collection("gmk").document(name)
    doc.set({u"count": group.shape[0]})

    collection = doc.collection("sales")
    for row in group.itertuples():
        data = {
            u"link": row.link,
            u"sets": ast.literal_eval(row.sets),
            u"price": row.price,
            u"category": row.category,
            u"date": row.date,
        }

        collection.add(data)
