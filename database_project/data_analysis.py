import os
import json
import re

class DataAnalysis:
    def __init__(self, dir_root):
        self.dir_root = os.path.join(os.getcwd(), dir_root)
        self._data = None
        self._statistics_json = None

    def __0_基本参数__(self):
        pass

    @property
    def statistics_json(self):
        if self._statistics_json is None:
            with open(os.path.join(os.getcwd(), "-statistics.json"), "r", encoding="utf-8") as json_file:
                self._statistics_json = json.load(json_file)
        return self._statistics_json
    @property
    def data(self):
        if self._data is None:
            self._data = {}
            for file_name in os.listdir(self.dir_root):
                if file_name.endswith(".json"):
                    match = re.match(r"(\d+)_", file_name)
                    order = int(match.group(1))
                    file_path = os.path.join(self.dir_root, file_name)
                    with open(file_path, "r", encoding="utf-8") as json_file:
                        data = json.load(json_file)
                        self._data[order] = data
        return self._data

    def __1_统计分析__(self):
        pass

    def analysis_data(self):
        """用来看具体数据信息"""
        data = self.data
        statistics = self.statistics_json
        pass

    def analysis_incorrect_data(self):
        incorrect_list = self.statistics_json["ids"]["final_SQL"]["incorrect"]
        incorrect_ids = [item[1] for item in incorrect_list]
        for id in incorrect_ids:
            data_item = self.data[id]
            pass

if __name__ == '__main__':
    dir_root = '2024-12-28T15_08_34.969660'
    data_analysis = DataAnalysis(dir_root)
    # data_analysis.analysis_data()
    data_analysis.analysis_incorrect_data()

    #todo 第一个阶段

    #todo 统计token消耗
    #todo 统计价格花费

    #todo 统计不正确的问题都是什么原因
    #todo 统计error的原因

    #todo 统计不正确的问题都是哪个阶段导致的
    #todo 统计error都是哪个阶段导致的

    #todo 统计各个阶段的输入输出token


    #todo 第二个阶段

    #todo 1. 如何减少单次token消耗/价格消耗
    # 检查各个阶段token消耗，对应的提示词，看看有没有优化空间

    #todo 2. 如何减少错误率/如何提高正确率
    # 检查各个阶段的错误原因，优化提示词和流程
