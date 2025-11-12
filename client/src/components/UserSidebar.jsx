import React from 'react';


export default function UserSidebar({ username, users, isConnected, onStartPrivate, onDisconnect }) {
return (
<aside className="bg-white border-r border-gray-200 flex flex-col">
{/* Header */}
<div className="p-4 border-b border-gray-100 flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold">
{username?.[0]?.toUpperCase()}
</div>
<div className="flex-1">
<div className="font-semibold">{username}</div>
<div className="text-xs text-gray-500">{isConnected ? 'Online' : 'Offline'}</div>
</div>
<button
onClick={onDisconnect}
className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
>
Logout
</button>
</div>


{/* Search (placeholder for future) */}
<div className="p-3">
<input
className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
placeholder="Search or start new chat"
/>
</div>


{/* Users list */}
<div className="flex-1 overflow-y-auto">
{users && users.length > 0 ? (
users.map(u => (
<button
key={u.id}
onClick={() => onStartPrivate(u)}
className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
>
<div className="relative w-10 h-10">
<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
{u.username?.[0]?.toUpperCase()}
</div>
<span className="absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
</div>
<div className="flex-1">
<div className="font-medium">{u.username}</div>
<div className="text-xs text-gray-500">Tap to send a private message</div>
</div>
</button>
))
) : (
<div className="p-4 text-sm text-gray-500">No users online yet.</div>
)}
</div>
</aside>
);
}