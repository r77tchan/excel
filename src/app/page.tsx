'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function Home() {
  const rows = Array.from({ length: 100 }, (_, rowIndex) => rowIndex)
  const cols = Array.from({ length: 100 }, (_, colIndex) => colIndex)

  // 選択されたセルと文字入力を管理
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [cellValues, setCellValues] = useState<Record<string, string>>({})

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedCell) return // セルが選択されていない場合は何もしない

    const key = e.key
    if (key.length === 1 || key === 'Backspace') {
      const cellKey = `${selectedCell.row}-${selectedCell.col}`

      setCellValues((prev) => {
        const updated = { ...prev }
        if (key === 'Backspace') {
          updated[cellKey] = updated[cellKey]?.slice(0, -1) || '' // バックスペースで1文字削除
        } else {
          updated[cellKey] = (updated[cellKey] || '') + key // キー入力を追加
        }
        return updated
      })
    }
  }

  useEffect(() => {
    // キーボードイベントを設定
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCell])

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
                  >
                    {cellValues[`${rowIndex}-${colIndex}`] || ''}
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
