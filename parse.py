import pandas as pd
import re
import unicodedata

money_regex = r"([£€\$]\d+)|(\d+[£€\$])"
euro_to_usd = 1.2
pound_to_usd = 1.4

bad_words = ["stab", "screw", "snap in", "clip in", "pcb mount", "plate mount", "kbd", "pcb", "built", "polycarb", "pc", "koyu"]


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

    sets = {
        "base": "base",
        "nov": "novelties",
        "alpha": "alpha",
        "accent": "accent",
        "bars": "spacebars",
        "spacebar": "spacebars",
        "cable": "cable",
        "light base": "light base",
        "dark base": "dark base",
        "deskmat": "deskmat",
        "desk mat": "deskmat",
        "deskpad": "deskmat",
        "desk pad": "deskmat",
        "rama": "rama",
        "40s": "40s",
        "40's": "40s",
        "fourties": "40s",
        "mods": "mods",
        "extension": "extension",
        "numpad": "numpad",
    }

    sales_data = []
    bad_data = []

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
                    too_low = False
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

                        kits = set()
                        remove_base = False

                        for x in sets.keys():
                            if x in curr_str:
                                kits.add(sets[x])

                                if x == "light base" or x == "dark base":
                                    remove_base = True

                        t = temp_data.get("products", [])
                        bad_bundle = "bundle" in curr_str and not kits and not t

                        if i == 0 and not kits:
                            kits.add("base")

                        if remove_base and "base" in kits:
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

                                        kits.add("base")
                                        break

                            temp_data["products"] = list(kits)
                            temp_data["str"] = curr_str
                            if not too_low:
                                temp_data["price"] = curr_price

                        if temp_data["products"]:
                            temp_data["category"] = get_category(temp_data["products"])

                        if kits and i > 0:
                            if too_low or bad_bundle:
                                bad_data.append(
                                    [
                                        row[0],
                                        product_name,
                                        temp_data["products"],
                                        temp_data["price"],
                                        temp_data["category"],
                                        row.date,
                                    ]
                                )
                                too_low = False
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

                            temp_data["products"] = list(kits)
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
                                        too_low = True
                            else:
                                if not too_low:
                                    temp_data["price"] = min(
                                        temp_data["price"], curr_price
                                    )

                    if temp_data["products"]:
                        temp_data["category"] = get_category(temp_data["products"])

                    if too_low or bad_bundle:
                        bad_data.append(
                            [
                                row[0],
                                product_name,
                                temp_data["products"],
                                temp_data["price"],
                                temp_data["category"],
                                row.date,
                            ]
                        )
                        too_low = False
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

    bad_df = pd.DataFrame(
        bad_data, columns=["link", "product", "sets", "price", "category", "date"]
    )
    bad_df["date"] = pd.to_datetime(bad_df["date"], unit="s")
    bad_df["product"] = bad_df["product"].apply(remove_accents)
    bad_df["product"].replace(r"\W+$", "", regex=True, inplace=True)

    return (sales_df, bad_df)


if __name__ == "__main__":
    a = parse_prices("april2020.csv")
    a[0].to_csv("good_data2.csv")
    a[1].to_csv("bad_data2.csv")