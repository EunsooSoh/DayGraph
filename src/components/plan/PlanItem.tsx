/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState } from 'react';
import type { Plan, PlanRecord, RecordStatus } from '../../types';
import * as storage from '../../lib/storage';
import { uid } from '../../lib/date';
import { CATEGORY_COLORS } from '../../lib/constants';

interface Props {
  plan: Plan;
  record?: PlanRecord;
  onUpdate: () => void;
}

const STATUS_STYLES: { [K in RecordStatus]: { bg: string; border: string; label: string } } = {
  DONE:     { bg: 'bg-green-900/40', border: 'border-green-500', label: 'Done' },
  MISSED:   { bg: 'bg-red-900/40', border: 'border-red-500', label: 'Missed' },
  REPLACED: { bg: 'bg-blue-900/40', border: 'border-blue-500', label: 'Replaced' },
};


export default function PlanItem({ plan, record, onUpdate }: Props) {
  const [showMemo, setShowMemo] = useState(false);
  const [memo, setMemo] = useState(record?.memo || '');
  const [replacedWith, setReplacedWith] = useState(record?.replacedWith || '');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(plan.title);

  const currentStatus = record?.status;
  const style = currentStatus ? STATUS_STYLES[currentStatus] : null;

  function setStatus(status: RecordStatus) {
    if (status === 'REPLACED' && !replacedWith) {
      setShowMemo(true);
      return;
    }
    storage.upsertRecord({
      id: record?.id || uid(),
      planId: plan.id,
      status,
      memo: memo || undefined,
      replacedWith: status === 'REPLACED' ? replacedWith : undefined,
      recordedAt: new Date().toISOString(),
    });
    onUpdate();
  }

  function clearStatus() {
    storage.deleteRecord(plan.id);
    onUpdate();
  }

  function handleDelete() {
    if (!window.confirm('이 계획을 삭제하시겠습니까?')) return;
    storage.deletePlan(plan.id);
    onUpdate();
  }

  function handleEditSave() {
    if (editTitle.trim()) {
      storage.updatePlan(plan.id, { title: editTitle.trim() });
      setEditing(false);
      onUpdate();
    }
  }

  function handleSaveMemo() {
    if (replacedWith.trim()) {
      storage.upsertRecord({
        id: record?.id || uid(),
        planId: plan.id,
        status: 'REPLACED',
        memo: memo || undefined,
        replacedWith: replacedWith.trim(),
        recordedAt: new Date().toISOString(),
      });
      setShowMemo(false);
      onUpdate();
    }
  }

  const catColor = CATEGORY_COLORS[plan.category] || CATEGORY_COLORS['기타'];

  return (
    <div className={`rounded-lg border p-3 mb-2 transition-all ${style ? `${style.bg} ${style.border}` : 'border-gray-700 bg-gray-800/50'}`}>
      <div className="flex items-center justify-between gap-2 whitespace-nowrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {plan.time && (
            <span className="text-xs text-gray-400 font-mono shrink-0 w-[3.2rem] text-right">
              {plan.time}
            </span>
          )}
          <span className={`${catColor} text-xs px-2 py-0.5 rounded-full text-white shrink-0`}>
            {plan.category}
          </span>
          {editing ? (
            <input
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm flex-1"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
              onBlur={handleEditSave}
              autoFocus
            />
          ) : (
            <span
              className={`text-sm truncate cursor-pointer ${currentStatus === 'DONE' ? 'line-through text-gray-400' : ''}`}
              onDoubleClick={() => setEditing(true)}
            >
              {plan.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Status buttons */}
          <button
            onClick={() => currentStatus === 'DONE' ? clearStatus() : setStatus('DONE')}
            className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-colors
              ${currentStatus === 'DONE' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-green-800 hover:text-green-300'}`}
            title="Done"
          >
            &#10003;
          </button>
          <button
            onClick={() => currentStatus === 'MISSED' ? clearStatus() : setStatus('MISSED')}
            className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-colors
              ${currentStatus === 'MISSED' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-red-800 hover:text-red-300'}`}
            title="Missed"
          >
            &#10005;
          </button>
          <button
            onClick={() => {
              if (currentStatus === 'REPLACED') { clearStatus(); return; }
              setShowMemo(true);
            }}
            className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-colors
              ${currentStatus === 'REPLACED' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-blue-800 hover:text-blue-300'}`}
            title="Replaced"
          >
            &#8635;
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded flex items-center justify-center text-xs bg-gray-700 text-gray-500 hover:bg-red-900 hover:text-red-400 transition-colors ml-1"
            title="Delete"
          >
            &#128465;
          </button>
        </div>
      </div>

      {/* Memo for REPLACED */}
      {showMemo && (
        <div className="mt-2 flex flex-col gap-2">
          <input
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
            placeholder="대신 무엇을 했나요?"
            value={replacedWith}
            onChange={(e) => setReplacedWith(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveMemo()}
            autoFocus
          />
          <input
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
            placeholder="메모 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveMemo()}
          />
          <div className="flex gap-2">
            <button onClick={handleSaveMemo} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">저장</button>
            <button onClick={() => setShowMemo(false)} className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500">취소</button>
          </div>
        </div>
      )}

      {/* Show replaced info */}
      {currentStatus === 'REPLACED' && record?.replacedWith && !showMemo && (
        <div className="mt-1 text-xs text-blue-300">
          &#8594; {record.replacedWith}
        </div>
      )}

      {/* Show memo */}
      {record?.memo && !showMemo && (
        <div className="mt-1 text-xs text-gray-400 italic">
          {record.memo}
        </div>
      )}
    </div>
  );
}
