
def main(search_type):
    search_type_is_valid = 0
    if search_type and search_type in ["webSearch", "academicSearch", "scienceSearch", "videoSearch", "socialSearch"]:
        search_type_is_valid = 1

    return {
        "search_type_is_valid": search_type_is_valid
    }