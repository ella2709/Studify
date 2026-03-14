export async function askAi(materialText, question) {
  const res = await fetch("http://localhost:3001/api/ai/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      materialText,
      question,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data;
}