'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function Home() {
  const rows = Array.from({ length: 100 }, (_, rowIndex) => rowIndex)
  const cols = Array.from({ length: 100 }, (_, colIndex) => colIndex)

  // 選択されたセルと文字入力を管理
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null) // 選択されたセル
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null) // 編集モードのセル
  const [cellValues, setCellValues] = useState<Record<string, string>>({}) // 各セルの値

  // セルのクリックで選択状態に
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (editingCell?.row === rowIndex && editingCell?.col === colIndex) return
    setSelectedCell({ row: rowIndex, col: colIndex }) // 選択状態を更新
    setEditingCell(null) // 編集モードを解除
  }

  // ダブルクリックで編集モードに切り替え
  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex }) // 編集モードに切り替え
  }

  // テキスト入力時の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCell) return // 編集モードでない場合は何もしない

    const cellKey = `${editingCell.row}-${editingCell.col}`
    setCellValues((prev) => ({ ...prev, [cellKey]: e.target.value }))
  }

  // キーボードイベントの処理（コピーペースト）
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedCell) return // セルが選択されていない場合は何もしない

    // 編集モードじゃない時、ctrlなどは除く
    const isPrintableKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
    if (!editingCell && (isPrintableKey || e.key === 'Backspace' || e.key === 'Enter')) {
      setEditingCell(selectedCell) // 編集モードへ
      e.preventDefault()
      //const cellKey = `${selectedCell.row}-${selectedCell.col}`
      //setCellValues((prev) => ({ ...prev, [cellKey]: '' })) // 上書き
    }

    if ((e.metaKey || e.ctrlKey) && !editingCell) {
      e.preventDefault()
      if (e.key === 'v') {
        navigator.clipboard.readText().then((pastedValue) => {
          const cellKey = `${selectedCell.row}-${selectedCell.col}`
          setCellValues((prev) => ({ ...prev, [cellKey]: pastedValue })) // クリップボードの内容で上書き
        })
      }
      if (e.key === 'c') {
        const cellKey = `${selectedCell.row}-${selectedCell.col}`
        const valueToCopy = cellValues[cellKey] || ''
        navigator.clipboard.writeText(valueToCopy)
      }
    }

    // エンターキー
    if (e.key === 'Enter') {
      if (editingCell) {
        setEditingCell(null)
      }
    }

    // 十字キー
    if (!editingCell) {
      switch (e.key) {
        case 'ArrowUp':
          setSelectedCell((prev) => (prev ? { row: Math.max(prev.row - 1, 1), col: prev.col } : null))
          e.preventDefault()
          break
        case 'ArrowDown':
          setSelectedCell((prev) => (prev ? { row: Math.min(prev.row + 1, rows.length - 1), col: prev.col } : null))
          e.preventDefault()
          break
        case 'ArrowLeft':
          setSelectedCell((prev) => (prev ? { row: prev.row, col: Math.max(prev.col - 1, 1) } : null))
          e.preventDefault()
          break
        case 'ArrowRight':
          setSelectedCell((prev) => (prev ? { row: prev.row, col: Math.min(prev.col + 1, cols.length - 1) } : null))
          e.preventDefault()
          break
      }
    }
  }

  useEffect(() => {
    if (editingCell) {
      // console.log('編集モードが有効になりました：', editingCell)
    }
  }, [editingCell])

  // キーボードイベントの設定
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCell, cellValues, editingCell])

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Excelライクの動作をjavascriptで実現</h1>
      <table className={styles.table}>
        <tbody>
          {rows.map((rowIndex) => (
            <tr key={rowIndex}>
              {cols.map((colIndex) =>
                colIndex === 0 || rowIndex === 0 ? (
                  <th key={`${rowIndex}-${colIndex}`}>{rowIndex === 0 ? colIndex : rowIndex}</th>
                ) : (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? styles.selected : ''
                    } ${editingCell?.row === rowIndex && editingCell?.col === colIndex ? styles.editing : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                      <input
                        className={styles.input}
                        type="text"
                        value={cellValues[`${rowIndex}-${colIndex}`] || ''}
                        size={Math.max(cellValues[`${rowIndex}-${colIndex}`]?.length * 2 || 1, 1)}
                        onChange={handleInputChange}
                        autoFocus
                        onBlur={(e) => {
                          const value = e.target.value // 入力フィールドの現在の値を取得
                          if (editingCell) {
                            // 編集モード中のセルが存在する場合
                            const cellKey = `${editingCell.row}-${editingCell.col}` // セルの位置を一意に識別するキー
                            setCellValues((prev) => ({ ...prev, [cellKey]: value })) // セルの値を更新
                          }
                          setEditingCell(null) // 編集モードを終了(`editingCell` をリセット)
                        }}
                      />
                    ) : (
                      cellValues[`${rowIndex}-${colIndex}`] || ''
                    )}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <p>操作</p>
      <p>クリック → 選択状態へ</p>
      <p>ダブルクリック → 編集状態へ</p>
      <br />
      <p>選択中</p>
      <p>任意のキー → 編集状態へ</p>
      <p>十字キー → 移動</p>
      <p>ctrl + c → 全コピー</p>
      <p>ctrl + v → 上書き貼り付け</p>
      <br />
      <p>編集中</p>
      <p>Enterキー → 選択状態へ</p>
      <p>十字キー → デフォルトカーソル移動</p>
      <p>ctrl + cなど → デフォルト挙動</p>
      <br />
    </div>
  )
}
