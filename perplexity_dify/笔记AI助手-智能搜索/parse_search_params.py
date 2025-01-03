
def main(mode):
    if mode not in ["speed","balanced"]:
        mode = "speed"

    return {
        "parsed_mode": mode
    }