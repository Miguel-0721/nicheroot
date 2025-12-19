"use client";

type Block =
  | { type: "paragraph"; value: string }
  | {
      type: "list";
      value: { title?: string; items: string[] };
    }
  | {
      type: "table";
      value: {
        title?: string;
        columns: string[];
        rows: string[][];
        explanation?: string;
      };
    };

export default function BlueprintBlockRenderer({
  blocks,
}: {
  blocks: Block[];
}) {
  if (!blocks || blocks.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No content available for this section.
      </p>
    );
  }

  return (
    <div className="text-gray-700 space-y-7">
      {blocks.map((block, i) => {
        // ---------- PARAGRAPH ----------
   if (block.type === "paragraph") {
  return (
    <div
      key={i}
      className="pt-8 border-t border-gray-100 first:pt-0 first:border-t-0"
    >
      <p className="leading-relaxed whitespace-pre-line max-w-prose text-gray-800">
        {block.value}
      </p>
    </div>
  );
}


        // ---------- LIST ----------
        if (block.type === "list") {
          return (
            <div
              key={i}
              className="pt-6 border-t border-gray-100"
            >
              {block.value.title && (
                <div className="mb-2 text-sm font-semibold text-gray-700">
                  {block.value.title}
                </div>
              )}

              <ul className="list-disc pl-5 space-y-1">
                {block.value.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }

        // ---------- TABLE ----------
        if (block.type === "table") {
          return (
            <div
              key={i}
              className="pt-6 border-t border-gray-100"
            >
              {block.value.title && (
                <div className="mb-3 font-medium text-gray-800">
                  {block.value.title}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {block.value.columns.map((col, c) => (
                        <th
                          key={c}
                          className="px-3 py-2 text-left font-semibold border-b"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.value.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="px-3 py-2 border-b align-top"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {block.value.explanation && (
                <p className="mt-2 text-sm text-gray-500">
                  {block.value.explanation}
                </p>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
