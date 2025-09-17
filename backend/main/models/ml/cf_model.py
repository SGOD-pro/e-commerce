# pip install implicit scipy
import implicit
from scipy.sparse import coo_matrix
import numpy as np
import joblib

def build_cf_model_from_interactions():
    logs = list(interactions_collection.find({}))  # use a reasonable time window
    user_map, item_map = {}, {}
    rows, cols, vals = [], [], []
    for l in logs:
        u = l["user_id"]
        i = str(l["product_id"])
        event = l.get("event", "view")
        weight = {"view":1, "cart":3, "purchase":5, "favorite":2}.get(event,1)
        if u not in user_map: user_map[u] = len(user_map)
        if i not in item_map: item_map[i] = len(item_map)
        rows.append(user_map[u])
        cols.append(item_map[i])
        vals.append(weight)
    mat = coo_matrix((vals, (rows, cols)), shape=(len(user_map), len(item_map)))
    model = implicit.als.AlternatingLeastSquares(factors=64, regularization=0.01, iterations=20)
    model.fit(mat.T)  # implicit lib expects item-user matrix
    joblib.dump((model, user_map, item_map), "als_model.pkl")


# load model
model, user_map, item_map = joblib.load("als_model.pkl")
def recommend_cf(user_id, N=10):
    if user_id not in user_map:
        return []
    uid = user_map[user_id]
    recs = model.recommend(uid, user_items=None, N=N)  # returns (item_idx, score)
    # map indices back to product ids
    inv_item_map = {v:k for k,v in item_map.items()}
    return [(inv_item_map[idx], score) for idx, score in recs]
