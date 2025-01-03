
def main(search_res, user_prompt2):

    return {
        "summary_prompt": search_res[0]["summary_prompt"],
        "all_docs": search_res[0]["all_docs"],
        "user_prompt2": user_prompt2
    }