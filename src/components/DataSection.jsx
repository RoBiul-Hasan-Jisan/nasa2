import React from "react";

export default function DataSection({ title, content }) {
  return (
    <div className="p-6 m-4 rounded-2xl shadow-lg bg-white/10 text-white">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p>{content}</p>
    </div>
  );
}
