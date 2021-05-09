import firebase_admin
from firebase_admin import credentials, firestore
import glob
import pandas as pd
import ast
from datetime import datetime

cred = credentials.Certificate("./firebaseAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


# sales = glob.glob("sales/*")
# for s in sales:

s = "sales/sales_november2020.csv"
date_orig = s.split("_")[1][:-4]
date = datetime.strptime(date_orig, "%B%Y")
next_month = date.month + 1
if next_month > 12:
    next_month = 0
next_date = datetime(date.year, next_month, date.day)
date_data = {u"start": date, u"end": next_date}

df = pd.read_csv(s)
df["date"] = pd.to_datetime(df["date"])
grouped = df.groupby("product")
for name, group in grouped:
    date_doc = db.collection(name).document(date_orig)
    collection = date_doc.collection("sales")
    date_doc.set(date_data)
    for row in group.itertuples():
        data = {
            u"link": row.link,
            u"sets": ast.literal_eval(row.sets),
            u"price": row.price,
            u"category": row.category,
            u"date": row.date,
        }

        collection.add(data)
