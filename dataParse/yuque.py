#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @Author : 童浩
# @Email  : 1310554512@qq.com
# @Date   : 2024/12/03
import json
import os
import yaml
from collections import deque


class YuqueParse:
    def __init__(self, root_dir=""):
        # 存储知识库的根目录
        self.root_dir = root_dir
        self.meta_file_path = os.path.join(self.root_dir, "$meta.json")
        self.docId_list = []
        for root, _, files in os.walk(self.root_dir):
            for file in files:
                if file == "$meta.json":
                    continue
                self.docId_list.append(file[:-5])

    def __0_工具函数__(self):
        pass

    @classmethod
    def read_json_file(cls, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            return data
        except Exception as e:
            print(f"Error reading JSON file: {e}")
            return None

    def parseDoc(self, doc_id):
        """
        解析文档信息
        :param doc_path:
        :return:
        """
        doc_path = os.path.join(self.root_dir, doc_id + ".json")
        doc_json = YuqueParse.read_json_file(doc_path)
        pass

    def parseMeta(self):
        """
        解析元数据信息
        :return: 返回meta信息，返回一个知识库的单向链表
        """
        meta_json = YuqueParse.read_json_file(self.meta_file_path)
        meta_json = json.loads(meta_json['meta'])
        toc_data = yaml.safe_load(meta_json["book"]["tocYml"])
        return toc_data

    def parseMetaToTree(self):
        """
        解析元数据信息，并生成知识库的树状结构
        :return: 返回一个知识库的树状结构
        """
        toc_data = self.parseMeta()
        toc_tree = {}
        node_map = {}
        pending_dq = deque(toc_data)

        def addNodeToTree(node, toc_tree, node_map, pending_dq):
            if node["type"] == 'META':
                toc_tree = {
                    "root": {
                        "content": node,
                        "children": []
                    }
                }
                return

            if not toc_tree:
                pending_dq.append(node)
                return

            uuid = node["uuid"]
            parent_uuid = node["parent_uuid"]
            prev_uuid = node["prev_uuid"]

            # 如果父节点还未在树中，延迟处理
            if parent_uuid and parent_uuid not in node_map:
                pending_dq.append(node)
                return

            if prev_uuid and prev_uuid not in node_map:
                pending_dq.append(node)
                return

            # 将当前节点添加到父节点的children中
            if parent_uuid and prev_uuid:
                parent = node_map[parent_uuid]
                parent.setdefault("children", {})[uuid] = node
            elif parent_uuid and not prev_uuid:
                node_map[parent_uuid]["children"].append(node)
            elif not parent_uuid and not prev_uuid:
                toc_tree["root"][uuid] = {
                    "content": node,
                    "children": []
                }
            else:
                toc_tree

            # 注册当前节点
            node_map[uuid] = node

        retries = len(pending_dq)
        while pending_dq and retries > 0:
            retries -= 1
            node = pending_dq.popleft()
            addNodeToTree(node, toc_tree, node_map, pending_dq)

        if retries == 0 and pending_dq:
            raise ValueError("Some nodes could not be processed due to missing parent nodes.")

    def display_tree(self, toc_tree, current=None, level=0):
        """
        打印树结构。
        """
        if current is None:
            current = toc_tree
        for uuid, node in current.items():
            print("  " * level + f"- {node['title']} (UUID: {uuid})")
            if "children" in node:
                self.display_tree(toc_tree, node["children"], level + 1)


if __name__ == '__main__':
    root_dir = r"C:\home\tonghao\笔记AI\笔记 AI\0a223c0117332234633712792899"
    yuqueParse = YuqueParse(root_dir)
    # for doc_id in yuqueParse.docId_list:
    #     yuqueParse.parseDoc(doc_id)
    yuqueParse.parseMeta()
