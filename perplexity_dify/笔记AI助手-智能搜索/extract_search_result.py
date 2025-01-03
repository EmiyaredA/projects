
def main(search_res, user_prompt2):

    search_type = search_res[0].get("search_type", "")

    return {
        "all_docs": search_res[0]["all_docs"],
        "user_prompt2": user_prompt2
    }