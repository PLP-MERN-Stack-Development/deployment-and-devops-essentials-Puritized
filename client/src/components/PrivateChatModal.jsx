import React, { useEffect, useRef, useState } from 'react';


export default function PrivateChatModal({ target, onClose, onSend }) {
const [text, setText] = useState('');
const inputRef = useRef(null);


useEffect(() => {
if (target && inputRef.current) inputRef.current.focus();
}, [target]);


if (!target) return null;


const handleSend = () => {
const t = text.trim();
if (!t) return;
onSend(t);
setText('');
};


return (
<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
<div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
<div className="flex items-center justify-between mb-3">
<div>
<div className="text-sm text-gray-500">Private message to</div>
<div className="font-semibold">{target.username}</div>
</div>
<button onClick={onClose} className="px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-gray-50">Close</button>
</div>


<textarea
ref={inputRef}
className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
rows={4}
placeholder={`Write a private message to ${target.username}`}
value={text}
onChange={(e) => setText(e.target.value)}
/>


<div className="mt-3 flex justify-end gap-2">
<button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">Cancel</button>
<button onClick={handleSend} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white">Send</button>
</div>
</div>
</div>
);
}