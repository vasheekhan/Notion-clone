import { useState } from "react";

function PageTitle() {
  const [title, setTitle] = useState("");

  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Untitled"
      className="page-title"
    />
  );
}

export default PageTitle;