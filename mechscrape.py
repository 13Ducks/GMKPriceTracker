import praw
import requests
CLIENT_ID = 'WcHieQApODE5EA'
CLIENT_SECRET = 'saiU9E_3sWIazKUU4f4ngaACoSs7Qw'
url = "https://www.reddit.com/r/mechmarket/comments/ko00z5/january_confirmed_trade_thread/"
trades = []


def main():
    with open('pw.txt', 'r') as f:
        pw = f.read()
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        password=pw,
        user_agent="MechGraph/0.0.0",
        username="ScurySnek21",
    )
    #submission = reddit.submission(url = 'https://www.reddit.com/r/mechmarket/comments/mxup7u/usca_h_r3_gmk_burgundy_light_use_epbt_blue_keycap/')
    #print(submission.selftext)
    #sleep(10)
    submission = reddit.submission(url=url)
    submission.comments.replace_more(limit=None)
    #submission.comments.replace_more(limit=0)
    f = open('gmktest.txt', 'a')
    d = open('jangmk.txt', 'a', encoding="utf-8")
    for top_level_comment in submission.comments:
        other = None
        confirmed = False
        added = False
        rawtext = top_level_comment.body
        author = top_level_comment.author
        commentLink = top_level_comment.permalink
        date = top_level_comment.created_utc
        if 'gmk' in rawtext.lower():
            for sub_comment in top_level_comment.replies:
                if 'confirmed' in str(sub_comment.body).lower():
                    confirmed = True
                    for sub_sub_comment in sub_comment.replies:
                        if 'added' in str(sub_sub_comment.body).lower():
                            added=True
                            params = {'author':str(author), 'subreddit':'mechmarket', 'after':int(date-2678400), 'before':int(date)}
                            print(params)
                            print(rawtext)
                            posts = requests.get('https://api.pushshift.io/reddit/search/submission/', params=params)
                            try:
                                for x in posts.json()['data']:
                                    d.write(f"{str(author)}, {rawtext}, {x['title']}, {x['full_link']} \n")
                                    d.write(x['selftext'] + '\n\nu/')
                            except Exception:
                                d.write('\n')

                other = sub_comment.author
        haha = Trade(rawtext=rawtext, commentID=top_level_comment.id, author=author, commentLink=commentLink, confirmed=confirmed, added=added, date=date, other=other)
        trades.append(haha)
    for x in trades:
        pass
        #print(type(x.date))
        #f.write(str(x) + '\n')
    #f.close()



class Trade:
    def __init__(self, rawtext, commentID, author=None, other=None, item=None, ammount=1, price=0, action=None, commentLink=None, saleLink=None, confirmed=False, added=False, date=None):
        self.author=author
        self.other=other
        self.item=item
        self.ammount=ammount
        self.price=price
        self.action=action
        self.commentLink=commentLink
        self.commentID=commentID
        self.confirmed=confirmed
        self.added=added
        self.date=date
        self.saleLink=saleLink
        self.rawtext=rawtext
    def __str__(self):
        """override string"""
        return f'{self.author}, {self.rawtext}, {self.commentID}, {self.commentLink}, {self.confirmed}, {self.added}, {self.other}, {self.date}'
    def parse_raw(self):
        """
        Try and find the item, amount, and action from the rawtext
        """
        pass
    def find_price(self):
        """
        Find the listing and price of the item sold
        """
        pass
    def check_confirm(self):
        """
        Check if the trade is confirmed
        """
        pass
    def save_to_file(self):
        """
        put trade in spreadsheet(for later)
        """
        pass

class Item:
    def __init__(self, name=None, ammount=1, meanprice=0, trades=[]):
        self.name=name
        self.meanprice=meanprice
        self.trades=trades
    def add_trade(self, trade):
        """
        add a trade for the item
        """
        trades.append(trade)
    
    
if __name__ == '__main__':
    main()

# import requests
# auth = requests.auth.HTTPBasicAuth(CLIENT_ID, SECRET_KEY)
# data = {
#     'grant_type':'password',
#     'username':'ScurySnek21',
#     'password':pw
# }
# headers = {'User-Agent':'MechGraph/0.0.0'}
# res = requests.post('https://www.reddit.com/api/v1/access_token', auth=auth, data=data, headers=headers)
# TOKEN = res.json()['access_token']
# headers['Authorization'] = f'bearer {TOKEN}'
