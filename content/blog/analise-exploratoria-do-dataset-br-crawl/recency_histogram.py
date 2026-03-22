"""Run with `uv run --with matplotlib --with pandas recency_histogram.py`"""

import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

DB_PATH = "../../backend/brcrawl.sqlite3"

def load_recency():
    conn = sqlite3.connect(DB_PATH)

    query = """
    SELECT
        feed_id,
        MAX(published_at) AS last_post_at,
        CAST(julianday('now') - julianday(MAX(published_at)) AS INTEGER) AS days_since_last_post
    FROM feed_items
    GROUP BY feed_id HAVING days_since_last_post >= 0
    ORDER BY days_since_last_post ASC
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    return df


def plot_histogram(df):
    recency = df["days_since_last_post"]

    plt.figure(figsize=(9,6))

    plt.hist(recency, bins=100)

    plt.xlabel("Days since last post")
    plt.ylabel("Number of blogs")
    plt.title("Blog Recency Distribution")

    plt.tight_layout()
    plt.savefig("recency_histogram.png")
    plt.show()


def plot_log_histogram(df):
    recency = df["days_since_last_post"]

    plt.figure(figsize=(9,6))

    plt.hist(recency, bins=100)

    plt.xscale("log")

    plt.xlabel("Days since last post (log scale)")
    plt.ylabel("Number of blogs")
    plt.title("Blog Recency Distribution (log scale)")

    plt.tight_layout()
    plt.savefig("recency_histogram_log.png")
    plt.show()


def bucket_recency(df):

    bins = [0, 30, 90, 180, 365, 730, 1825, 3650]
    labels = [
        "0-1 month",
        "1-3 months",
        "3-6 months",
        "6-12 months",
        "1-2 years",
        "2-5 years",
        "5-10 years"
    ]

    df["recency_bucket"] = pd.cut(df["days_since_last_post"], bins=bins, labels=labels)

    counts = df["recency_bucket"].value_counts().sort_index()

    print("\nRecency buckets:")
    print(counts)


def main():
    df = load_recency()

    print("Blogs analyzed:", len(df))

    print("\nBasic recency stats:")
    print(df["days_since_last_post"].describe())
    bucket_recency(df)

    plot_histogram(df)
    plot_log_histogram(df)


if __name__ == "__main__":
    main()
