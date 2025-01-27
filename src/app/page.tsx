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

    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'v') {
        e.preventDefault()

        // 編集モード中の場合
        if (editingCell) {
          navigator.clipboard.readText().then((pastedValue) => {
            const cellKey = `${editingCell.row}-${editingCell.col}`
            setCellValues((prev) => ({ ...prev, [cellKey]: (prev[cellKey] || '') + pastedValue })) // 既存の文字列に追加
          })
        }
        // 選択モード中の場合
        else if (selectedCell) {
          navigator.clipboard.readText().then((pastedValue) => {
            const cellKey = `${selectedCell.row}-${selectedCell.col}`
            setCellValues((prev) => ({ ...prev, [cellKey]: pastedValue })) // クリップボードの内容で上書き
          })
        }
      }
      if (e.key === 'c') {
        e.preventDefault()
        const cellKey = `${selectedCell.row}-${selectedCell.col}`
        const valueToCopy = cellValues[cellKey] || ''
        navigator.clipboard.writeText(valueToCopy)
      }
    }
  }

  // キーボードイベントの設定
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCell, cellValues])

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
                    className={selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? styles.selected : ''}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                      <input
                        className={styles.input}
                        type="text"
                        value={cellValues[`${rowIndex}-${colIndex}`] || ''}
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
    </div>
  )
}
