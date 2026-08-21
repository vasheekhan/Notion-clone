const NOTES = [
  {
    tag: "Idea",
    body: "Spaced repetition for reading notes",
    top: "8%",
    left: "6%",
    delay: "0s",
  },
  {
    tag: "Todo",
    body: "Refactor the auth module before Friday",
    top: "36%",
    left: "2%",
    delay: "1.1s",
  },
  {
    tag: "Draft",
    body: "Intro paragraph — third pass",
    top: "46%",
    left: "32%",
    delay: "2.3s",
  },
  {
    tag: "Meeting",
    body: "Roadmap notes → link to Q3 doc",
    top: "6%",
    left: "58%",
    delay: "0.6s",
  },
  {
    tag: "Recipe",
    body: "Less salt, longer simmer",
    top: "40%",
    left: "68%",
    delay: "1.8s",
  },
];

export default function Constellation() {
  return (
    <div className="constellation">

      <svg
        className="constellation-lines"
        viewBox="0 0 600 500"
        preserveAspectRatio="none"
      >
        <line
          x1="90"
          y1="60"
          x2="360"
          y2="40"
          className="const-line const-line-a"
        />

        <line
          x1="30"
          y1="190"
          x2="360"
          y2="40"
          className="const-line"
        />

        <line
          x1="30"
          y1="190"
          x2="200"
          y2="250"
          className="const-line const-line-b"
        />

        <line
          x1="360"
          y1="40"
          x2="410"
          y2="220"
          className="const-line"
        />

        <line
          x1="200"
          y1="250"
          x2="410"
          y2="220"
          className="const-line const-line-a"
        />
      </svg>

      {NOTES.map((note, index) => (
        <div
          key={index}
          className="note-chip"
          style={{
            top: note.top,
            left: note.left,
            animationDelay: note.delay,
          }}
        >
          <span className="note-tag">
            {note.tag}
          </span>

          <span className="note-body">
            {note.body}
          </span>
        </div>
      ))}

    </div>
  );
}