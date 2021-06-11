import pandas as pd
import re
import unicodedata

money_regex = r"([£€\$]\d+)|(\d+[£€\$])"
euro_to_usd = 1.2
pound_to_usd = 1.4

bad_words = ["stab", "screw", "snap in", "clip in", "pcb mount", "plate mount"]


def get_category(products):
    has_base = any(["base" in p for p in products])
    if len(products) == 1 and has_base:
        return "base"
    elif len(products) == 1:
        return "single"
    elif len(products) > 1 and has_base:
        return "bundle"

    return "other"


def parse_prices(filename):
    print(f"Starting parsing from {filename}")
    df = pd.read_csv(f"datasets/{filename}")
    df.drop(df.columns[0], axis=1, inplace=True)
    df.dropna(subset=["post"], inplace=True)
    df.set_index("link", inplace=True)

    df["post_lower"] = df["post"].str.lower()
    df["title_lower"] = df["title"].str.lower()

    sets = [
        "base",
        "nov",
        "alpha",
        "accent",
        "bars",
        "spacebar",
        "cable",
        "light base",
        "dark base",
        "deskmat",
        "desk mat",
        "cable",
        "rama",
        "40s",
        "40's",
        "fourties",
        "mods",
        "extension",
        "numpad",
    ]

    sales_data = []
    strange_data = []

    def match_product(row):
        s = row.post_lower.split("\n")
        for l in s:
            low = l.lower()

            if "gmk " in low and ("~~" in low or "sold" in low):
                if any([b in low for b in bad_words]):
                    continue

                after_gmk = low.split("gmk ")[1]
                product_name = "gmk " + re.split(r"[^\w\+\.]", after_gmk)[0]

                matches = re.split(money_regex, low)
                temp_data = {}

                if len(matches) > 1:
                    remove_entry = False
                    addToWeird = False
                    for i in range(0, len(matches) - 1, 3):
                        curr_price = int(
                            matches[i + 1][1:]
                            if matches[i + 1]
                            else matches[i + 2][:-1]
                        )
                        currency = (
                            matches[i + 1][0] if matches[i + 1] else matches[i + 2][-1]
                        )
                        if currency == "€":
                            curr_price = round(curr_price * euro_to_usd)
                        if currency == "£":
                            curr_price = round(curr_price * pound_to_usd)

                        curr_str = matches[i]

                        kits = []
                        removeBase = False

                        for x in sets:
                            if x in curr_str:
                                if x == "nov":
                                    kits.append("novelties")
                                elif x == "light base" or x == "dark base":
                                    removeBase = True
                                    kits.insert(0, x)
                                elif x == "bars" or x == "spacebar":
                                    if "spacebars" not in kits:
                                        kits.append("spacebars")
                                elif x in ["40s", "40's", "fourties"]:
                                    kits.append("40s")
                                else:
                                    kits.append(x)

                        if i == 0 and not kits:
                            kits.append("base")

                        if removeBase and "base" in kits:
                            kits.remove("base")

                        if i == 0:
                            has_base = any(["base" in k for k in kits])
                            if not has_base:
                                for x in after_gmk.split(" "):
                                    if any([se in x for se in sets]):
                                        break

                                    if "+" in x or "," in x:
                                        if x == "olivia++":
                                            continue

                                        kits.insert(0, "base")
                                        break

                            temp_data["products"] = kits
                            temp_data["str"] = curr_str
                            if not addToWeird:
                                temp_data["price"] = curr_price

                        if temp_data["products"]:
                            temp_data["category"] = get_category(temp_data["products"])

                        if kits and i > 0:
                            if not remove_entry:
                                if addToWeird:
                                    strange_data.append(
                                        [
                                            row[0],
                                            product_name,
                                            temp_data["products"],
                                            temp_data["price"],
                                            temp_data["category"],
                                            row.date,
                                        ]
                                    )
                                    addToWeird = False
                                else:
                                    sales_data.append(
                                        [
                                            row[0],
                                            product_name,
                                            temp_data["products"],
                                            temp_data["price"],
                                            temp_data["category"],
                                            row.date,
                                        ]
                                    )
                            else:
                                remove_entry = False
                            temp_data["products"] = kits
                            temp_data["str"] = curr_str
                            temp_data["price"] = curr_price
                        else:
                            if curr_price <= 50:
                                if (
                                    len(temp_data["products"]) <= 1
                                    and "base" not in temp_data["products"]
                                ):
                                    temp_data["price"] = min(
                                        temp_data["price"], curr_price
                                    )
                                else:
                                    if (
                                        "base" in temp_data["products"]
                                        and temp_data["price"] <= 50
                                    ):
                                        remove_entry = True
                            elif curr_price <= 100:
                                if(
                                    "base" in temp_data["products"]
                                ):
                                    addToWeird = True

                            else:
                                if not addToWeird:
                                    temp_data["price"] = min(temp_data["price"], curr_price)

                    if temp_data["products"]:
                        temp_data["category"] = get_category(temp_data["products"])

                    if not remove_entry:
                        if addToWeird:
                            strange_data.append(
                                    [
                                    row[0],
                                    product_name,
                                    temp_data["products"],
                                    temp_data["price"],
                                    temp_data["category"],
                                    row.date,
                                ]
                            )
                            addToWeird = False
                        else:
                            sales_data.append(
                                [
                                    row[0],
                                    product_name,
                                    temp_data["products"],
                                    temp_data["price"],
                                    temp_data["category"],
                                    row.date,
                                ]
                            )
                    else:
                        remove_entry = True

    for row in df.itertuples():
        match_product(row)

    sales_df = pd.DataFrame(
        sales_data, columns=["link", "product", "sets", "price", "category", "date"]
    )
    sales_df["date"] = pd.to_datetime(sales_df["date"], unit="s")

    remove_accents = (
        lambda text: unicodedata.normalize("NFD", text)
        .encode("ascii", "ignore")
        .decode("utf-8")
    )
    sales_df["product"] = sales_df["product"].apply(remove_accents)
    sales_df["product"].replace(r"\W+$", "", regex=True, inplace=True)

    manual_df = pd.DataFrame(
        strange_data, columns=["link", "product", "sets", "price", "category", "date"]
    )
    manual_df["date"] = pd.to_datetime(manual_df["date"], unit="s")
    manual_df["product"] = manual_df["product"].apply(remove_accents)
    manual_df["product"].replace(r"\W+$", "", regex=True, inplace=True)

    return (sales_df, manual_df)

if __name__ == '__main__':
    a = parse_prices('april2020.csv')
    a[0].to_csv("sales/good_data.csv")
    a[1].to_csv("sales/bad_data.csv")