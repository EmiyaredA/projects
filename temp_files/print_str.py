from datetime import datetime, timedelta

def get_current_utc_datetime():
    # 获取当前时间（UTC时区）
    current_datetime = datetime.utcnow()
    # 将其格式化为ISO 8601格式
    beijing_time = current_datetime + timedelta(hours=8)
    return f"Current date & time in ISO format (local timezone) is: {beijing_time.isoformat()}Z"  # 'Z'表示UTC时间

print(get_current_utc_datetime())