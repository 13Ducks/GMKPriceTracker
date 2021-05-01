import praw
import requests
import pandas as pd
CLIENT_ID = 'WcHieQApODE5EA'
CLIENT_SECRET = 'saiU9E_3sWIazKUU4f4ngaACoSs7Qw'
url = "https://www.reddit.com/r/mechmarket/comments/ko00z5/january_confirmed_trade_thread/"
trades = []


def parse(link, reddit, filename):
    submission = reddit.submission(url=link)
    submission.comments.replace_more(limit=None)
    df = pd.DataFrame()
    for top_level_comment in submission.comments: #all lvl one comments, the sold blank to whatever ones
        rawtext, link, author, date = top_level_comment.body.lower(), top_level_comment.permalink, top_level_comment.author, top_level_comment.created_utc
        if 'gmk' in rawtext:
            try:
                for sub_comment in top_level_comment.replies: #check for replies to trades that involve gmk
                    if 'confirmed' in str(sub_comment.body).lower(): #check if trade is confirmed
                        for sub_sub_comment in sub_comment.replies: #check for replies to confirmed
                            if 'added' in str(sub_sub_comment.body).lower(): #check if it is added
                                if 'bought' in rawtext or 'purchased' in rawtext:
                                    author = rawtext.split('u/')[-1]
                                print(f'{rawtext}, author chosen was:{author}')
                                params = {'author':str(author), 'subreddit':'mechmarket', 'after':int(date-2678400), 'before':int(date)}
                                print(params)
                                posts = requests.get('https://api.pushshift.io/reddit/search/submission/', params=params)
                                for x in posts.json()['data']:
                                    df = df.append({
                                        'author': str(author),
                                        'link': x['full_link'],
                                        'rawtext': rawtext,
                                        'title': x['title'],
                                        'post': x['selftext'],
                                        'date': x['created_utc']
                                    }, ignore_index=True)
            except Exception:
                print('error wtf!')
    df.to_csv(f'{filename}.csv')
    
    
if __name__ == 'main':
    with open('pw.txt', 'r') as f:
        pw = f.read()
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        password=pw,
        user_agent="MechGraph/0.0.0",
        username="ScurySnek21",
    )
    parse(url, reddit, 'temp')