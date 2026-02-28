#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
小小程序员逻辑思维训练器 - 后端服务器
端口: 2017
"""

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='dist')
CORS(app)

# 关卡数据
LEVELS = [
    {
        "id": 1,
        "name": "初识指令",
        "description": "使用前进指令到达终点！",
        "grid_size": 5,
        "start": {"x": 0, "y": 4, "direction": "right"},
        "target": {"x": 4, "y": 4},
        "obstacles": [],
        "max_blocks": 5,
        "hint": "拖拽4个'前进'积木",
        "difficulty": "简单"
    },
    {
        "id": 2,
        "name": "学会转弯",
        "description": "需要转弯才能到达终点哦！",
        "grid_size": 5,
        "start": {"x": 0, "y": 4, "direction": "right"},
        "target": {"x": 4, "y": 0},
        "obstacles": [],
        "max_blocks": 10,
        "hint": "先前进，再右转，再前进",
        "difficulty": "简单"
    },
    {
        "id": 3,
        "name": "避开障碍",
        "description": "绕过障碍物到达终点！",
        "grid_size": 6,
        "start": {"x": 0, "y": 5, "direction": "right"},
        "target": {"x": 5, "y": 0},
        "obstacles": [{"x": 3, "y": 5}, {"x": 3, "y": 4}, {"x": 3, "y": 3}],
        "max_blocks": 15,
        "hint": "从下方绕过去",
        "difficulty": "中等"
    },
    {
        "id": 4,
        "name": "循环的力量",
        "description": "用重复循环简化代码！",
        "grid_size": 7,
        "start": {"x": 0, "y": 3, "direction": "right"},
        "target": {"x": 6, "y": 3},
        "obstacles": [],
        "max_blocks": 5,
        "hint": "使用'重复6次' + '前进'",
        "difficulty": "中等"
    },
    {
        "id": 5,
        "name": "复杂迷宫",
        "description": "综合运用各种指令！",
        "grid_size": 8,
        "start": {"x": 0, "y": 7, "direction": "right"},
        "target": {"x": 7, "y": 0},
        "obstacles": [
            {"x": 2, "y": 7}, {"x": 2, "y": 6}, {"x": 2, "y": 5},
            {"x": 5, "y": 3}, {"x": 5, "y": 2}, {"x": 5, "y": 1},
            {"x": 6, "y": 4}
        ],
        "max_blocks": 20,
        "hint": "先向上，再向右，再向下",
        "difficulty": "困难"
    },
    {
        "id": 6,
        "name": "算法挑战",
        "description": "找出最短路径！",
        "grid_size": 8,
        "start": {"x": 0, "y": 0, "direction": "down"},
        "target": {"x": 7, "y": 7},
        "obstacles": [
            {"x": 1, "y": 1}, {"x": 2, "y": 2}, {"x": 3, "y": 3},
            {"x": 4, "y": 4}, {"x": 5, "y": 5}, {"x": 6, "y": 6}
        ],
        "max_blocks": 25,
        "hint": "走另一条对角线路径",
        "difficulty": "困难"
    }
]

# 成就数据
ACHIEVEMENTS = [
    {"id": "first_step", "name": "第一步", "description": "完成第1关", "icon": "🌟"},
    {"id": "loop_master", "name": "循环大师", "description": "使用循环完成关卡", "icon": "🔄"},
    {"id": "perfect_run", "name": "完美运行", "description": "用最少的积木完成关卡", "icon": "✨"},
    {"id": "level_3", "name": "初级程序员", "description": "完成第3关", "icon": "🥉"},
    {"id": "level_5", "name": "中级程序员", "description": "完成第5关", "icon": "🥈"},
    {"id": "all_clear", "name": "编程小达人", "description": "完成所有关卡", "icon": "🥇"}
]

# 存储用户进度（内存存储，重启后重置）
user_progress = {}

@app.route('/api/levels', methods=['GET'])
def get_levels():
    """获取所有关卡列表"""
    return jsonify({
        "success": True,
        "data": LEVELS
    })

@app.route('/api/levels/<int:level_id>', methods=['GET'])
def get_level(level_id):
    """获取单个关卡详情"""
    level = next((l for l in LEVELS if l["id"] == level_id), None)
    if level:
        return jsonify({"success": True, "data": level})
    return jsonify({"success": False, "error": "关卡不存在"}), 404

@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    """获取所有成就"""
    return jsonify({
        "success": True,
        "data": ACHIEVEMENTS
    })

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """获取用户进度"""
    user_id = request.args.get('user_id', 'default')
    progress = user_progress.get(user_id, {
        "completed_levels": [],
        "achievements": [],
        "total_time": 0,
        "best_scores": {}
    })
    return jsonify({"success": True, "data": progress})

@app.route('/api/progress', methods=['POST'])
def save_progress():
    """保存用户进度"""
    data = request.json
    user_id = data.get('user_id', 'default')
    
    if user_id not in user_progress:
        user_progress[user_id] = {
            "completed_levels": [],
            "achievements": [],
            "total_time": 0,
            "best_scores": {}
        }
    
    # 更新完成的关卡
    level_id = data.get('level_id')
    if level_id and level_id not in user_progress[user_id]["completed_levels"]:
        user_progress[user_id]["completed_levels"].append(level_id)
    
    # 更新最佳成绩
    if 'score' in data and 'blocks_used' in data:
        level_id_str = str(level_id)
        current_best = user_progress[user_id]["best_scores"].get(level_id_str)
        if not current_best or data['blocks_used'] < current_best['blocks_used']:
            user_progress[user_id]["best_scores"][level_id_str] = {
                "blocks_used": data['blocks_used'],
                "time": data.get('time', 0)
            }
    
    # 检查成就
    new_achievements = check_achievements(user_id)
    
    return jsonify({
        "success": True,
        "data": user_progress[user_id],
        "new_achievements": new_achievements
    })

def check_achievements(user_id):
    """检查用户是否获得新成就"""
    progress = user_progress.get(user_id, {})
    completed = progress.get("completed_levels", [])
    current_achievements = progress.get("achievements", [])
    new_achievements = []
    
    # 检查各个成就条件
    if 1 in completed and "first_step" not in current_achievements:
        new_achievements.append("first_step")
    
    if 3 in completed and "level_3" not in current_achievements:
        new_achievements.append("level_3")
    
    if 5 in completed and "level_5" not in current_achievements:
        new_achievements.append("level_5")
    
    if len(completed) == len(LEVELS) and "all_clear" not in current_achievements:
        new_achievements.append("all_clear")
    
    # 添加新成就
    for ach_id in new_achievements:
        if ach_id not in current_achievements:
            user_progress[user_id]["achievements"].append(ach_id)
    
    return new_achievements

@app.route('/api/execute', methods=['POST'])
def execute_code():
    """执行代码并返回结果"""
    data = request.json
    commands = data.get('commands', [])
    level_id = data.get('level_id', 1)
    
    level = next((l for l in LEVELS if l["id"] == level_id), None)
    if not level:
        return jsonify({"success": False, "error": "关卡不存在"}), 404
    
    # 模拟执行
    result = simulate_execution(commands, level)
    
    return jsonify({
        "success": True,
        "data": result
    })

def simulate_execution(commands, level):
    """模拟代码执行"""
    start = level["start"]
    target = level["target"]
    obstacles = level.get("obstacles", [])
    grid_size = level["grid_size"]
    
    x, y = start["x"], start["y"]
    direction = start["direction"]  # right, down, left, up
    
    directions = ["right", "down", "left", "up"]
    dx = [1, 0, -1, 0]
    dy = [0, 1, 0, -1]
    
    path = [{"x": x, "y": y, "direction": direction}]
    steps = 0
    max_steps = 100  # 防止无限循环
    
    def execute_command(cmd):
        nonlocal x, y, direction, steps
        
        if steps >= max_steps:
            return False, "步骤太多啦，是不是陷入循环了？"
        
        cmd_type = cmd.get("type")
        
        if cmd_type == "forward":
            dir_idx = directions.index(direction)
            new_x = x + dx[dir_idx]
            new_y = y + dy[dir_idx]
            
            # 检查边界
            if new_x < 0 or new_x >= grid_size or new_y < 0 or new_y >= grid_size:
                return False, "哎呀，撞墙了！"
            
            # 检查障碍物
            if any(o["x"] == new_x and o["y"] == new_y for o in obstacles):
                return False, "哎呀，撞到障碍物了！"
            
            x, y = new_x, new_y
            steps += 1
            path.append({"x": x, "y": y, "direction": direction})
            
        elif cmd_type == "turn_left":
            dir_idx = directions.index(direction)
            direction = directions[(dir_idx - 1) % 4]
            steps += 1
            path.append({"x": x, "y": y, "direction": direction})
            
        elif cmd_type == "turn_right":
            dir_idx = directions.index(direction)
            direction = directions[(dir_idx + 1) % 4]
            steps += 1
            path.append({"x": x, "y": y, "direction": direction})
            
        elif cmd_type == "repeat":
            count = cmd.get("count", 1)
            sub_commands = cmd.get("commands", [])
            for _ in range(count):
                for sub_cmd in sub_commands:
                    success, msg = execute_command(sub_cmd)
                    if not success:
                        return False, msg
        
        return True, "ok"
    
    # 执行所有命令
    for cmd in commands:
        success, msg = execute_command(cmd)
        if not success:
            return {
                "success": False,
                "error": msg,
                "path": path,
                "final_position": {"x": x, "y": y}
            }
    
    # 检查是否到达目标
    reached = (x == target["x"] and y == target["y"])
    
    return {
        "success": True,
        "reached_target": reached,
        "path": path,
        "final_position": {"x": x, "y": y},
        "steps": steps,
        "message": "太棒了！到达终点！" if reached else "还没到终点哦，继续加油！"
    }

@app.route('/api/python-code', methods=['POST'])
def generate_python_code():
    """将积木转换为Python代码"""
    data = request.json
    commands = data.get('commands', [])
    
    code_lines = ["# 小小程序员生成的Python代码", ""]
    
    def generate_commands(cmds, indent=0):
        lines = []
        indent_str = "    " * indent
        
        for cmd in cmds:
            cmd_type = cmd.get("type")
            
            if cmd_type == "forward":
                lines.append(f"{indent_str}forward()  # 前进")
            elif cmd_type == "turn_left":
                lines.append(f"{indent_str}turn_left()  # 左转")
            elif cmd_type == "turn_right":
                lines.append(f"{indent_str}turn_right()  # 右转")
            elif cmd_type == "repeat":
                count = cmd.get("count", 1)
                lines.append(f"{indent_str}for i in range({count}):  # 重复{count}次")
                sub_lines = generate_commands(cmd.get("commands", []), indent + 1)
                lines.extend(sub_lines)
        
        return lines
    
    code_lines.extend(generate_commands(commands))
    
    return jsonify({
        "success": True,
        "code": "\n".join(code_lines)
    })

# 静态文件服务
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """提供静态文件"""
    if path == "":
        path = "index.html"
    
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    
    # 前端路由处理
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 小小程序员逻辑思维训练器")
    print("🌐 服务器地址: http://localhost:2017")
    print("=" * 50)
    app.run(host='0.0.0.0', port=2017, debug=True)
