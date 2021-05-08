import firebase_admin
from firebase_admin import credentials, firestore
import glob
import pandas as pd

cred = credentials.Certificate("./firebaseAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# data = {u"name": u"Los Angeles", u"state": u"CA", u"country": u"USA"}

# Add a new doc in collection 'cities' with ID 'LA'
# db.collection(u"cities").document(u"LA").set(data)

# sales = glob.glob("sales/*")
# c = 0
# for s in sales:
c = 0
s = "sales/sales_november2020.csv"
df = pd.read_csv(s)
grouped = df.groupby("product")
for name, group in grouped:
    collection = db.collection(name)
    for row in group.itertuples():
        data = {
            u"link": row.link,
            u"sets": row.sets,
            u"price": row.price,
            u"date": row.date,
        }

        collection.document(str(row[0])).set(data)
    c += 1
    if c > 3:
        break
