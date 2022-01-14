import praw
from psaw import PushshiftAPI
import pandas as pd
import datetime as dt

with open("credentials.txt", "r") as f:
    creds = [c.strip() for c in f]
    reddit = praw.Reddit(
        client_id="WcHieQApODE5EA",
        client_secret=creds[0],
        password=creds[1],
        user_agent="MechGraph/0.0.0",
        username="ManyManyDucks",
    )

api = PushshiftAPI(reddit)

times = [int(dt.datetime(2020, m, 1).timestamp()) for m in range(1, 13)] + [
    int(dt.datetime(2021, m, 1).timestamp()) for m in range(1, 12)
]

months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
]

names = [m + "2020" for m in months] + [m + "2021" for m in months]


def get_data(start, end, name):
    print(f"Starting data collection for: {name}")
    df = pd.DataFrame()

    gen = api.search_submissions(
        after=start,
        before=end,
        subreddit="mechmarket",
        q="gmk",
    )

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

    df.to_csv(f"datasets/{name}.csv")


for i, name in enumerate(names):
    get_data(times[i], times[i + 1], name)
