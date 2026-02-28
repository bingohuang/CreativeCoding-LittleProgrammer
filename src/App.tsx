import { useState, useEffect } from 'react'
import './App.css'
import { 
  Play, RotateCcw, Trash2, ChevronLeft, Trophy, 
  Code, Lightbulb, Star, Lock, CheckCircle2,
  ArrowRight, RefreshCw, ChevronRight, Home, Award,
  Settings2, Plus, Minus, X, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

// 类型定义
interface Position {
  x: number
  y: number
  direction: 'right' | 'down' | 'left' | 'up'
}

interface Level {
  id: number
  name: string
  description: string
  grid_size: number
  start: Position
  target: { x: number; y: number }
  obstacles: { x: number; y: number }[]
  max_blocks: number
  hint: string
  difficulty: string
}

interface Command {
  id: string
  type: 'forward' | 'turn_left' | 'turn_right' | 'repeat'
  count?: number
  commands?: Command[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}

// API 基础URL
const API_BASE = ''

function App() {
  // 状态
  const [currentView, setCurrentView] = useState<'home' | 'levels' | 'game'>('home')
  const [levels, setLevels] = useState<Level[]>([])
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [commands, setCommands] = useState<Command[]>([])
  const [pythonCode, setPythonCode] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [characterPos, setCharacterPos] = useState<Position>({ x: 0, y: 0, direction: 'right' })
  const [path, setPath] = useState<Position[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // 重复积木编辑相关状态
  const [editingRepeatId, setEditingRepeatId] = useState<string | null>(null)
  const [showRepeatDialog, setShowRepeatDialog] = useState(false)
  const [repeatCount, setRepeatCount] = useState(3)
  const [editingRepeatForCount, setEditingRepeatForCount] = useState<string | null>(null)

  // 初始化
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [levelsRes, achievementsRes, progressRes] = await Promise.all([
        fetch(`${API_BASE}/api/levels`),
        fetch(`${API_BASE}/api/achievements`),
        fetch(`${API_BASE}/api/progress?user_id=default`)
      ])

      const levelsData = await levelsRes.json()
      const achievementsData = await achievementsRes.json()
      const progressData = await progressRes.json()

      if (levelsData.success) setLevels(levelsData.data)
      if (achievementsData.success) setAchievements(achievementsData.data)
      if (progressData.success) {
        setCompletedLevels(progressData.data.completed_levels || [])
        setUnlockedAchievements(progressData.data.achievements || [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      setLevels(getDefaultLevels())
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultLevels = (): Level[] => [
    {
      id: 1,
      name: '初识指令',
      description: '使用前进指令到达终点！',
      grid_size: 5,
      start: { x: 0, y: 4, direction: 'right' },
      target: { x: 4, y: 4 },
      obstacles: [],
      max_blocks: 5,
      hint: '点击4次"前进"积木',
      difficulty: '简单'
    },
    {
      id: 2,
      name: '学会转弯',
      description: '需要转弯才能到达终点哦！',
      grid_size: 5,
      start: { x: 0, y: 4, direction: 'right' },
      target: { x: 4, y: 0 },
      obstacles: [],
      max_blocks: 10,
      hint: '先前进，再右转，再前进',
      difficulty: '简单'
    },
    {
      id: 3,
      name: '避开障碍',
      description: '绕过障碍物到达终点！',
      grid_size: 6,
      start: { x: 0, y: 5, direction: 'right' },
      target: { x: 5, y: 0 },
      obstacles: [{ x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 }],
      max_blocks: 15,
      hint: '从下方绕过去',
      difficulty: '中等'
    },
    {
      id: 4,
      name: '循环的力量',
      description: '用重复循环简化代码！',
      grid_size: 7,
      start: { x: 0, y: 3, direction: 'right' },
      target: { x: 6, y: 3 },
      obstacles: [],
      max_blocks: 5,
      hint: '添加"重复"积木，设置6次，然后点击"前进"添加进去',
      difficulty: '中等'
    },
    {
      id: 5,
      name: '复杂迷宫',
      description: '综合运用各种指令！',
      grid_size: 8,
      start: { x: 0, y: 7, direction: 'right' },
      target: { x: 7, y: 0 },
      obstacles: [
        { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 5 },
        { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 },
        { x: 6, y: 4 }
      ],
      max_blocks: 20,
      hint: '先向上，再向右，再向下',
      difficulty: '困难'
    },
    {
      id: 6,
      name: '算法挑战',
      description: '找出最短路径！',
      grid_size: 8,
      start: { x: 0, y: 0, direction: 'down' },
      target: { x: 7, y: 7 },
      obstacles: [
        { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
        { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }
      ],
      max_blocks: 25,
      hint: '走另一条对角线路径',
      difficulty: '困难'
    }
  ]

  // 选择关卡
  const selectLevel = (level: Level) => {
    if (level.id > 1 && !completedLevels.includes(level.id - 1)) {
      return
    }
    setCurrentLevel(level)
    setCharacterPos({ ...level.start })
    setCommands([])
    setPath([{ ...level.start }])
    setPythonCode('# 点击积木开始编程')
    setShowSuccess(false)
    setErrorMsg('')
    setEditingRepeatId(null)
    setCurrentView('game')
  }

  // 计算总积木数（包括嵌套的）
  const countTotalBlocks = (cmds: Command[]): number => {
    let count = 0
    for (const cmd of cmds) {
      count++
      if (cmd.type === 'repeat' && cmd.commands) {
        count += countTotalBlocks(cmd.commands)
      }
    }
    return count
  }

  // 添加指令
  const addCommand = (type: Command['type']) => {
    if (!currentLevel) return
    
    const totalBlocks = countTotalBlocks(commands)
    if (totalBlocks >= currentLevel.max_blocks) {
      setErrorMsg(`最多只能使用${currentLevel.max_blocks}个积木哦！`)
      setTimeout(() => setErrorMsg(''), 2000)
      return
    }

    // 如果正在编辑重复积木，且点击的不是重复指令，则添加到其中
    if (editingRepeatId && type !== 'repeat') {
      const newCommands = addCommandToRepeat(commands, editingRepeatId, type)
      setCommands(newCommands)
      updatePythonCode(newCommands)
      return
    }

    const newCommand: Command = {
      id: Date.now().toString(),
      type,
      ...(type === 'repeat' ? { count: 3, commands: [] } : {})
    }
    
    const updatedCommands = [...commands, newCommand]
    setCommands(updatedCommands)
    updatePythonCode(updatedCommands)
    
    // 不再自动进入编辑模式，让用户手动点击重复积木来编辑
  }

  // 向重复积木中添加指令
  const addCommandToRepeat = (cmds: Command[], repeatId: string, type: Command['type']): Command[] => {
    return cmds.map(cmd => {
      if (cmd.id === repeatId && cmd.type === 'repeat') {
        const newSubCommand: Command = {
          id: Date.now().toString() + Math.random(),
          type
        }
        return {
          ...cmd,
          commands: [...(cmd.commands || []), newSubCommand]
        }
      }
      if (cmd.type === 'repeat' && cmd.commands) {
        return {
          ...cmd,
          commands: addCommandToRepeat(cmd.commands, repeatId, type)
        }
      }
      return cmd
    })
  }

  // 删除指令
  const removeCommand = (id: string) => {
    const newCommands = removeCommandRecursive(commands, id)
    setCommands(newCommands)
    updatePythonCode(newCommands)
    if (editingRepeatId === id) {
      setEditingRepeatId(null)
    }
  }

  // 递归删除指令
  const removeCommandRecursive = (cmds: Command[], id: string): Command[] => {
    return cmds.filter(cmd => {
      if (cmd.id === id) return false
      if (cmd.type === 'repeat' && cmd.commands) {
        cmd.commands = removeCommandRecursive(cmd.commands, id)
      }
      return true
    })
  }

  // 删除重复积木中的子指令
  const removeSubCommand = (repeatId: string, subId: string) => {
    const newCommands = commands.map(cmd => {
      if (cmd.id === repeatId && cmd.type === 'repeat') {
        return {
          ...cmd,
          commands: (cmd.commands || []).filter(sc => sc.id !== subId)
        }
      }
      if (cmd.type === 'repeat' && cmd.commands) {
        return {
          ...cmd,
          commands: removeSubCommandRecursive(cmd.commands, repeatId, subId)
        }
      }
      return cmd
    })
    setCommands(newCommands)
    updatePythonCode(newCommands)
  }

  const removeSubCommandRecursive = (cmds: Command[], repeatId: string, subId: string): Command[] => {
    return cmds.map(cmd => {
      if (cmd.id === repeatId && cmd.type === 'repeat') {
        return {
          ...cmd,
          commands: (cmd.commands || []).filter(sc => sc.id !== subId)
        }
      }
      if (cmd.type === 'repeat' && cmd.commands) {
        return {
          ...cmd,
          commands: removeSubCommandRecursive(cmd.commands, repeatId, subId)
        }
      }
      return cmd
    })
  }

  // 更新重复积木的次数
  const updateRepeatCount = (repeatId: string, count: number) => {
    const newCommands = updateRepeatCountRecursive(commands, repeatId, count)
    setCommands(newCommands)
    updatePythonCode(newCommands)
    setShowRepeatDialog(false)
    setEditingRepeatForCount(null)
  }

  const updateRepeatCountRecursive = (cmds: Command[], repeatId: string, count: number): Command[] => {
    return cmds.map(cmd => {
      if (cmd.id === repeatId && cmd.type === 'repeat') {
        return { ...cmd, count }
      }
      if (cmd.type === 'repeat' && cmd.commands) {
        return {
          ...cmd,
          commands: updateRepeatCountRecursive(cmd.commands, repeatId, count)
        }
      }
      return cmd
    })
  }

  // 打开重复次数设置对话框
  const openRepeatCountDialog = (repeatId: string, currentCount: number) => {
    setEditingRepeatForCount(repeatId)
    setRepeatCount(currentCount)
    setShowRepeatDialog(true)
  }

  // 更新Python代码
  const updatePythonCode = async (cmds: Command[]) => {
    try {
      const res = await fetch(`${API_BASE}/api/python-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: cmds })
      })
      const data = await res.json()
      if (data.success) {
        setPythonCode(data.code)
      }
    } catch (error) {
      generateLocalPythonCode(cmds)
    }
  }

  const generateLocalPythonCode = (cmds: Command[]) => {
    const lines = ['# 小小程序员生成的Python代码', '']
    
    const generate = (commands: Command[], indent: number = 0): string[] => {
      const result: string[] = []
      const spaces = '    '.repeat(indent)
      
      commands.forEach(cmd => {
        switch (cmd.type) {
          case 'forward':
            result.push(`${spaces}forward()  # 前进`)
            break
          case 'turn_left':
            result.push(`${spaces}turn_left()  # 左转`)
            break
          case 'turn_right':
            result.push(`${spaces}turn_right()  # 右转`)
            break
          case 'repeat':
            result.push(`${spaces}for i in range(${cmd.count || 3}):  # 重复${cmd.count || 3}次`)
            if (cmd.commands && cmd.commands.length > 0) {
              result.push(...generate(cmd.commands, indent + 1))
            } else {
              result.push(`${spaces}    pass  # 这里还没有指令`)
            }
            break
        }
      })
      
      return result
    }
    
    setPythonCode(lines.concat(generate(cmds)).join('\n'))
  }

  // 执行程序
  const executeProgram = async () => {
    if (!currentLevel || commands.length === 0) return
    
    setIsExecuting(true)
    setErrorMsg('')
    setPath([{ ...currentLevel.start }])
    setEditingRepeatId(null)

    try {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commands, 
          level_id: currentLevel.id 
        })
      })
      const data = await res.json()
      
      if (data.success) {
        const result = data.data
        
        for (let i = 0; i < result.path.length; i++) {
          setCharacterPos(result.path[i])
          setPath(prev => [...prev.slice(0, i + 1), result.path[i]])
          await new Promise(r => setTimeout(r, 300))
        }

        if (result.reached_target) {
          setShowSuccess(true)
          await saveProgress()
        } else {
          setErrorMsg(result.message)
        }
      } else {
        setErrorMsg(data.error || '执行出错')
      }
    } catch (error) {
      executeLocally()
    } finally {
      setIsExecuting(false)
    }
  }

  // 本地执行（备用）
  const executeLocally = async () => {
    if (!currentLevel) return
    
    const directions = ['right', 'down', 'left', 'up'] as const
    const dx = [1, 0, -1, 0]
    const dy = [0, 1, 0, -1]
    
    let x = currentLevel.start.x
    let y = currentLevel.start.y
    let direction = currentLevel.start.direction
    const path: Position[] = [{ x, y, direction }]
    
    const executeCmd = (cmd: Command): boolean => {
      switch (cmd.type) {
        case 'forward':
          const dirIdx = directions.indexOf(direction)
          const newX = x + dx[dirIdx]
          const newY = y + dy[dirIdx]
          
          if (newX < 0 || newX >= currentLevel.grid_size || 
              newY < 0 || newY >= currentLevel.grid_size) {
            setErrorMsg('哎呀，撞墙了！')
            return false
          }
          
          if (currentLevel.obstacles.some(o => o.x === newX && o.y === newY)) {
            setErrorMsg('哎呀，撞到障碍物了！')
            return false
          }
          
          x = newX
          y = newY
          path.push({ x, y, direction })
          break
          
        case 'turn_left':
          direction = directions[(directions.indexOf(direction) - 1 + 4) % 4]
          path.push({ x, y, direction })
          break
          
        case 'turn_right':
          direction = directions[(directions.indexOf(direction) + 1) % 4]
          path.push({ x, y, direction })
          break
          
        case 'repeat':
          for (let i = 0; i < (cmd.count || 1); i++) {
            for (const subCmd of (cmd.commands || [])) {
              if (!executeCmd(subCmd)) return false
            }
          }
          break
      }
      return true
    }
    
    for (const cmd of commands) {
      if (!executeCmd(cmd)) {
        setIsExecuting(false)
        return
      }
    }
    
    for (let i = 0; i < path.length; i++) {
      setCharacterPos(path[i])
      setPath(prev => [...prev.slice(0, i + 1), path[i]])
      await new Promise(r => setTimeout(r, 300))
    }
    
    if (x === currentLevel.target.x && y === currentLevel.target.y) {
      setShowSuccess(true)
      await saveProgress()
    } else {
      setErrorMsg('还没到终点哦，继续加油！')
    }
    
    setIsExecuting(false)
  }

  // 保存进度
  const saveProgress = async () => {
    if (!currentLevel) return
    
    try {
      const res = await fetch(`${API_BASE}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'default',
          level_id: currentLevel.id,
          blocks_used: commands.length,
          time: Date.now()
        })
      })
      const data = await res.json()
      
      if (data.success) {
        setCompletedLevels(data.data.completed_levels || [])
        if (data.new_achievements?.length > 0) {
          const newAch = achievements.find(a => a.id === data.new_achievements[0])
          if (newAch) {
            setShowAchievement(newAch)
            setUnlockedAchievements(data.data.achievements || [])
          }
        }
      }
    } catch (error) {
      if (!completedLevels.includes(currentLevel.id)) {
        setCompletedLevels([...completedLevels, currentLevel.id])
      }
    }
  }

  // 重置关卡
  const resetLevel = () => {
    if (!currentLevel) return
    setCharacterPos({ ...currentLevel.start })
    setCommands([])
    setPath([{ ...currentLevel.start }])
    setPythonCode('# 点击积木开始编程')
    setShowSuccess(false)
    setErrorMsg('')
    setEditingRepeatId(null)
  }

  // 下一关
  const nextLevel = () => {
    if (!currentLevel) return
    const next = levels.find(l => l.id === currentLevel.id + 1)
    if (next) {
      selectLevel(next)
    }
  }

  // 渲染指令积木图标
  const getCommandIcon = (type: string, size: number = 4) => {
    switch (type) {
      case 'forward':
        return <ArrowRight className={`w-${size} h-${size}`} />
      case 'turn_left':
        return <RefreshCw className={`w-${size} h-${size}`} />
      case 'turn_right':
        return <RefreshCw className={`w-${size} h-${size}`} style={{ transform: 'scaleX(-1)' }} />
      default:
        return null
    }
  }

  // 渲染指令积木名称
  const getCommandName = (type: string) => {
    switch (type) {
      case 'forward': return '前进'
      case 'turn_left': return '左转'
      case 'turn_right': return '右转'
      default: return ''
    }
  }

  // 渲染首页
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center pt-12 pb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">小小程序员</h1>
          <p className="text-lg text-gray-600">逻辑思维训练器</p>
          <Badge className="mt-3 bg-blue-100 text-blue-700">适合小学三年级</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-2xl font-bold text-blue-600">{completedLevels.length}</div>
            <div className="text-sm text-gray-500">已完成关卡</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-1">⭐</div>
            <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
            <div className="text-sm text-gray-500">获得成就</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full btn-primary h-14 text-lg" onClick={() => setCurrentView('levels')}>
            <Play className="w-5 h-5 mr-2" />开始挑战
          </Button>
          <Button variant="outline" className="w-full btn-secondary h-14 text-lg" onClick={() => setCurrentView('levels')}>
            <Trophy className="w-5 h-5 mr-2" />查看成就
          </Button>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />你能学到什么
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">🎯</div>
              <div>
                <div className="font-medium text-gray-800">顺序执行</div>
                <div className="text-sm text-gray-500">理解程序按顺序运行</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🔄</div>
              <div>
                <div className="font-medium text-gray-800">循环结构</div>
                <div className="text-sm text-gray-500">用循环简化重复代码</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🐍</div>
              <div>
                <div className="font-medium text-gray-800">Python代码</div>
                <div className="text-sm text-gray-500">看到真实编程语言</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-400">
          <p>翠苑第一小学教育集团</p>
          <p>信息素养提升实践活动</p>
        </div>
      </div>
    </div>
  )

  // 渲染关卡选择
  const renderLevels = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')} className="mr-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">选择关卡</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">总进度</span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round((completedLevels.length / levels.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="fill" style={{ width: `${(completedLevels.length / levels.length) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {levels.map((level, index) => {
            const isLocked = index > 0 && !completedLevels.includes(level.id - 1)
            const isCompleted = completedLevels.includes(level.id)
            const isCurrent = !isLocked && !isCompleted
            
            return (
              <div
                key={level.id}
                className={`level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => !isLocked && selectLevel(level)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      isCompleted ? 'bg-green-100 text-green-600' :
                      isCurrent ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                       isLocked ? <Lock className="w-5 h-5" /> : level.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{level.name}</h3>
                      <p className="text-sm text-gray-500">{level.description}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    level.difficulty === '简单' ? 'bg-green-100 text-green-700' :
                    level.difficulty === '中等' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{level.difficulty}</Badge>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />我的成就
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map(ach => (
              <div key={ach.id} className={`achievement-badge ${!unlockedAchievements.includes(ach.id) ? 'locked' : ''}`}>
                <span className="icon">{ach.icon}</span>
                <span className="text-xs font-medium text-center">{ach.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染游戏界面
  const renderGame = () => {
    if (!currentLevel) return null
    
    const gridCells = []
    for (let y = 0; y < currentLevel.grid_size; y++) {
      for (let x = 0; x < currentLevel.grid_size; x++) {
        const isObstacle = currentLevel.obstacles.some(o => o.x === x && o.y === y)
        const isTarget = currentLevel.target.x === x && currentLevel.target.y === y
        const isCharacter = characterPos.x === x && characterPos.y === y
        const isPath = path.some((p, idx) => p.x === x && p.y === y && idx < path.length - 1)
        
        gridCells.push(
          <div 
            key={`${x}-${y}`}
            className={`grid-cell ${isObstacle ? 'obstacle' : ''} ${isTarget ? 'target' : ''} ${isPath ? 'path' : ''}`}
          >
            {isCharacter && (
              <div className={`character direction-${characterPos.direction}`}>🤖</div>
            )}
            {isTarget && !isCharacter && <div className="target-mark">🏁</div>}
          </div>
        )
      }
    }

    // 递归渲染指令列表
    const renderCommands = (cmds: Command[], depth: number = 0) => {
      return cmds.map((cmd) => {
        const isEditingThisRepeat = editingRepeatId === cmd.id && cmd.type === 'repeat'
        
        return (
          <div key={cmd.id} className="program-block" style={{ marginLeft: depth * 16 }}>
            {cmd.type === 'repeat' ? (
              // 重复积木
              <div 
                className={`block block-repeat ${isEditingThisRepeat ? 'ring-2 ring-white bg-purple-600' : ''}`}
                onClick={() => {
                  if (!isExecuting) {
                    setEditingRepeatId(isEditingThisRepeat ? null : cmd.id)
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>重复 {cmd.count} 次</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        openRepeatCountDialog(cmd.id, cmd.count || 3)
                      }}
                    >
                      <Settings2 className="w-3 h-3" />
                    </button>
                    {isEditingThisRepeat && (
                      <span className="text-xs bg-white/30 px-2 py-0.5 rounded">编辑中</span>
                    )}
                  </div>
                </div>
                {/* 子指令区域 */}
                <div 
                  className={`block-nested mt-2 ${isEditingThisRepeat ? 'bg-white/30' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {cmd.commands && cmd.commands.length > 0 ? (
                    <div className="space-y-1">
                      {cmd.commands.map((subCmd) => (
                        <div key={subCmd.id} className="flex items-center justify-between bg-white/20 rounded px-2 py-1">
                          <span className="text-xs flex items-center gap-1">
                            {getCommandIcon(subCmd.type, 3)}
                            {getCommandName(subCmd.type)}
                          </span>
                          <button
                            className="w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xs"
                            onClick={() => removeSubCommand(cmd.id, subCmd.id)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs opacity-70">
                      {isEditingThisRepeat ? '👆 点击上方指令添加到这里' : '点击此积木编辑内容'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              // 普通积木
              <div className={`block ${
                cmd.type === 'forward' ? 'block-forward' :
                cmd.type === 'turn_left' ? 'block-turn-left' :
                'block-turn-right'
              }`}>
                {getCommandIcon(cmd.type, 4)}
                {getCommandName(cmd.type)}
              </div>
            )}
            <button className="delete-btn" onClick={() => removeCommand(cmd.id)}>
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 头部 */}
        <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('levels')} className="mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-gray-800">{currentLevel.name}</h1>
              <p className="text-xs text-gray-500">{currentLevel.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHint(!showHint)} className={showHint ? 'text-yellow-600' : ''}>
              <Lightbulb className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={resetLevel}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4">
          {/* 编辑模式提示 */}
          {editingRepeatId && (
            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-3 rounded-r-lg mb-4 text-sm flex items-center justify-between">
              <span>📝 正在编辑重复积木（紫色高亮），点击上方指令添加进去</span>
              <button 
                className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium"
                onClick={() => setEditingRepeatId(null)}
              >
                完成编辑
              </button>
            </div>
          )}

          {showHint && <div className="hint-box mb-4"><p className="text-sm">💡 提示：{currentLevel.hint}</p></div>}
          {errorMsg && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg mb-4 text-sm">{errorMsg}</div>}

          {/* 游戏网格 */}
          <div className="game-grid mb-4" style={{ gridTemplateColumns: `repeat(${currentLevel.grid_size}, 1fr)` }}>
            {gridCells}
          </div>

          {/* 积木数量提示 */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              已用积木：{countTotalBlocks(commands)}/{currentLevel.max_blocks}
            </span>
            {editingRepeatId && (
              <span className="text-xs text-purple-600 font-medium">编辑模式中</span>
            )}
          </div>

          {/* 指令积木区 */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">
              {editingRepeatId ? '👇 点击指令添加到「重复积木」中' : '指令积木'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button className="block block-forward" onClick={() => addCommand('forward')} disabled={isExecuting}>
                <ArrowRight className="w-4 h-4" />前进
              </button>
              <button className="block block-turn-left" onClick={() => addCommand('turn_left')} disabled={isExecuting}>
                <RefreshCw className="w-4 h-4" />左转
              </button>
              <button className="block block-turn-right" onClick={() => addCommand('turn_right')} disabled={isExecuting}>
                <RefreshCw className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} />右转
              </button>
              {!editingRepeatId && (
                <button className="block block-repeat" onClick={() => addCommand('repeat')} disabled={isExecuting}>
                  <RefreshCw className="w-4 h-4" />重复
                </button>
              )}
            </div>
          </div>

          {/* 程序区 */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 text-sm">
                我的程序
                {editingRepeatId && <span className="ml-2 text-xs font-normal text-purple-600">（点击紫色积木继续编辑）</span>}
              </h3>
              {commands.length > 0 && (
                <button className="text-red-500 text-xs flex items-center" onClick={resetLevel}>
                  <Trash2 className="w-3 h-3 mr-1" />清空
                </button>
              )}
            </div>
            <div className="program-area min-h-[120px]">
              {commands.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  点击上方积木添加指令
                </div>
              ) : (
                renderCommands(commands)
              )}
            </div>
          </div>

          {/* Python代码显示 */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
              <Code className="w-4 h-4 mr-2" />Python代码
            </h3>
            <ScrollArea className="h-[120px]">
              <pre className="python-code text-xs">{pythonCode}</pre>
            </ScrollArea>
          </div>

          {/* 运行按钮 */}
          <Button
            className="w-full btn-primary h-14 text-lg mb-4"
            onClick={executeProgram}
            disabled={isExecuting || commands.length === 0}
          >
            {isExecuting ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />运行中...</> : <><Play className="w-5 h-5 mr-2" />运行程序</>}
          </Button>
        </div>

        {/* 成功弹窗 */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-[350px] text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl">🎉 恭喜通关！</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-600 mb-2">你成功完成了「{currentLevel.name}」！</p>
              <p className="text-sm text-gray-500">使用了 {countTotalBlocks(commands)} 个积木</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowSuccess(false); setCurrentView('levels') }}>
                <Home className="w-4 h-4 mr-2" />返回
              </Button>
              {currentLevel.id < levels.length && (
                <Button className="flex-1 btn-primary" onClick={() => { setShowSuccess(false); nextLevel() }}>
                  下一关<ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 成就弹窗 */}
        <Dialog open={!!showAchievement} onOpenChange={() => setShowAchievement(null)}>
          <DialogContent className="sm:max-w-[300px] text-center">
            <DialogHeader>
              <DialogTitle className="text-xl">✨ 获得成就</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="text-6xl mb-4">{showAchievement?.icon}</div>
              <h3 className="text-xl font-bold mb-2">{showAchievement?.name}</h3>
              <p className="text-gray-500 text-sm">{showAchievement?.description}</p>
            </div>
            <Button onClick={() => setShowAchievement(null)} className="w-full">太棒了！</Button>
          </DialogContent>
        </Dialog>

        {/* 重复次数设置弹窗 */}
        <Dialog open={showRepeatDialog} onOpenChange={setShowRepeatDialog}>
          <DialogContent className="sm:max-w-[280px] text-center">
            <DialogHeader>
              <DialogTitle className="text-lg">设置重复次数</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  onClick={() => setRepeatCount(Math.max(1, repeatCount - 1))}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-4xl font-bold text-orange-600 w-16">{repeatCount}</span>
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  onClick={() => setRepeatCount(Math.min(10, repeatCount + 1))}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">重复 {repeatCount} 次</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRepeatDialog(false)}>取消</Button>
              <Button 
                className="flex-1 btn-primary" 
                onClick={() => editingRepeatForCount && updateRepeatCount(editingRepeatForCount, repeatCount)}
              >
                <Check className="w-4 h-4 mr-1" />确定
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans">
      {currentView === 'home' && renderHome()}
      {currentView === 'levels' && renderLevels()}
      {currentView === 'game' && renderGame()}
    </div>
  )
}

export default App
