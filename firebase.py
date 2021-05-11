import firebase_admin
from firebase_admin import credentials, firestore
import glob
import pandas as pd
import ast
from datetime import datetime

cred = credentials.Certificate("./firebaseAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


sales = glob.glob("sales/*")
for s in sales:
    print(s)

    df = pd.read_csv(s)
    df["date"] = pd.to_datetime(df["date"])
    grouped = df.groupby("product")
    for name, group in grouped:
        collection = db.collection("gmk").document(name).collection("sales")
        for row in group.itertuples():
            data = {
                u"link": row.link,
                u"sets": ast.literal_eval(row.sets),
                u"price": row.price,
                u"category": row.category,
                u"date": row.date,
            }

            collection.add(data)
