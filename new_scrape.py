import praw
from psaw import PushshiftAPI
import pandas as pd
import datetime as dt

with open("pw.txt", "r") as f:
    pw = f.read()
    reddit = praw.Reddit(
        client_id="WcHieQApODE5EA",
        client_secret="saiU9E_3sWIazKUU4f4ngaACoSs7Qw",
        password=pw,
        user_agent="MechGraph/0.0.0",
        username="ManyManyDucks",
    )
api = PushshiftAPI(reddit)

start_epoch = int(dt.datetime(2021, 4, 1).timestamp())
end_epoch = int(dt.datetime(2021, 5, 1).timestamp())

df = pd.DataFrame()

gen = api.search_submissions(
    after=start_epoch,
    before=end_epoch,
    subreddit="mechmarket",
    q="gmk",
)

count = 0
for c in gen:
    if (
        c.link_flair_text in ["Selling", "Sold", "Trading"]
        and c.removed_by_category is None
    ):
        df = df.append(
            {
                "link": c.permalink,
                "date": c.created_utc,
                "title": c.title,
                "post": c.selftext,
            },
            ignore_index=True,
        )

    count += 1

    if count % 1000 == 0:
        print(count)

df.to_csv("testing.csv")
