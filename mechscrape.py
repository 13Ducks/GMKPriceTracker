import praw
import requests
CLIENT_ID = 'WcHieQApODE5EA'
CLIENT_SECRET = 'saiU9E_3sWIazKUU4f4ngaACoSs7Qw'
url = "https://www.reddit.com/r/mechmarket/comments/lut39h/march_confirmed_trade_thread/"
urls = {
    'april2021':'https://www.reddit.com/r/mechmarket/comments/mhgu4h/april_confirmed_trade_thread/', 
    'march2021':'https://www.reddit.com/r/mechmarket/comments/lut39h/march_confirmed_trade_thread/', 
    'feburary2021':'https://www.reddit.com/r/mechmarket/comments/l9ofve/february_confirmed_trade_thread/', 
    'january2021':'https://www.reddit.com/r/mechmarket/comments/ko00z5/january_confirmed_trade_thread/', 
    'december2020':'https://www.reddit.com/r/mechmarket/comments/k47lac/december_confirmed_trade_thread/', 
    'november2020':'https://www.reddit.com/r/mechmarket/comments/jlryhe/november_confirmed_trade_thread/',
    'october2020':'https://www.reddit.com/r/mechmarket/comments/j2vpe5/october_confirmed_trade_thread/',
    'september2020':'https://www.reddit.com/r/mechmarket/comments/ik7ly0/september_confirmed_trade_thread/'
    }
trades = []


def parse(link, reddit, filename):
    submission = reddit.submission(url=link)
    mm = reddit.subreddit("mechmarket")
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
                                #print(f'{rawtext}, author chosen was:{author}')
                                params = {'author':str(author), 'subreddit':'mechmarket', 'after':int(date-2678400), 'before':int(date)}
                                print(params)
                                for submission in mm.search(f'author:{author}'):
                                    time = submission.created_utc
                                    if time < date-2678400:
                                        break
                                    if time > date:
                                        continue
                                    df = df.append({
                                        'author':submission.author,
                                        'link': submission.permalink,
                                        'rawtext': rawtext,
                                        'title': submission.title,
                                        'post': submission.selftext,
                                        'date': time
                                    }, ignore_index=True)
            except Exception:
                print('error wtf!')
    df.to_csv(f'{filename}.csv')
    
    
if __name__ == '__main__':
    with open('pw.txt', 'r') as f:
        pw = f.read()
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        password=pw,
        user_agent="MechGraph/0.0.0",
        username="ScurySnek21",
    )
    #parse(url, reddit, 'temp')
    for x in urls.keys():
        parse(urls[x], reddit, x)
