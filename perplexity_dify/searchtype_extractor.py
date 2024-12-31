def main(class_name: str) -> dict:
    if "academicsearch" in class_name.lower():
        search_type_auto = "academicSearch"
    elif "socialsearch" in class_name.lower():
        search_type_auto = "socialSearch"
    elif "sciencesearch" in class_name.lower():
        search_type_auto = "scienceSearch"
    elif "videosearch" in class_name.lower():
        search_type_auto = "videoSearch"
    elif "websearch" in class_name.lower():
        search_type_auto = "webSearch"
    elif "not_needed" in class_name.lower():
        search_type_auto = "not_needed"
    else:
        search_type_auto = "not_needed"

    return {"search_type_auto": search_type_auto}
