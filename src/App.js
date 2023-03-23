import { useRef, useState } from "react";
import "./App.css";

function App() {
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState([]);

  const participant = [
    { id: 1, name: "Алексей Чистов" },
    { id: 2, name: "Ержан Тайкешев" },
    { id: 3, name: "Аюпов Данияр" },
  ];

  function onInput(event) {
    const input = event.target;
    setText(input.value);

    const value = input.value;
    const startPos = input.selectionStart;

    let prevText;

    if (value === prevText) return;
    prevText = value;

    const mentionRegex = RegExp(/@([а-яА-Яa-zA-Z]*\s?[а-яА-Яa-zA-Z]*)/g);
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      const mentionStart = match.index;
      const mentionEnd = mentionStart + match[0].length;
      let prevQuery;

      if (
        startPos >= mentionStart &&
        startPos <= mentionEnd &&
        match[0].startsWith("@") &&
        match[1] !== prevQuery
      ) {
        setQuery(match[1]);
        prevQuery = match[1];
        setShow(true);
      }
    }
  }

  function onClick(name) {
    const input = inputRef.current;
    const startPos = input.selectionStart;

    const mentionText = `@${name}`;

    if (startPos !== text.length) {
      const mentionRegex = RegExp(/@([а-яА-Яa-zA-Z]*\s?[а-яА-Яa-zA-Z]*)/g);
      let match;

      while ((match = mentionRegex.exec(text)) !== null) {
        const mentionStart = match.index;
        const mentionEnd = mentionStart + match[0].length;

        if (
          startPos >= mentionStart &&
          startPos <= mentionEnd &&
          match[0].startsWith("@")
        ) {
          const newText =
            text.slice(0, mentionStart) + mentionText + text.slice(mentionEnd);
          setText(newText.trim());
          setQuery("");
          setShow(false);
          input.focus();
          return;
        }
      }
    } else {
      const last = text.split(" ").pop();
      const mentionIndex = text.lastIndexOf("@");

      if (last.startsWith("@")) {
        const newText = text.substring(0, mentionIndex) + mentionText;
        setText(newText.trim());
        setQuery("");
        setShow(false);
        input.focus();
        return;
      } else {
        const newText = text.substring(0, mentionIndex) + mentionText;
        setText(newText.trim());
        setQuery("");
        setShow(false);
        input.focus();
        return;
      }
    }
  }

  function submit() {
    if (!Array.isArray(participant) || participant.length === 0) return;

    const mentionRegex = RegExp(/@([а-яА-Яa-zA-Z]*\s?[а-яА-Яa-zA-Z]*)/g);
    const replaceStr = text.replace(mentionRegex, (_, p2) => {
      const index = participant.findIndex((item) => item.name.includes(p2));

      if (index !== -1) {
        const item = participant[index];
        return `&@{"id": "${item.id}", "display": "${item.name}"}@&`;
      } else {
        return `@${p2}`;
      }
    });

    setMessage((prev) => [...prev, { id: Math.random(), text: replaceStr }]);
  }

  function replaceStr(text) {
    const mentionRegex = RegExp(/&@\{(.+?)\}@&/g);

    const result = text
      .replace(mentionRegex, (_, p2) => {
        const { display } = JSON.parse(`{${p2}}`);
        return `<span class='name'>@${display}</span>`;
      })
      .replace(/\n/g, "<br/>");

    return result;
  }

  return (
    <div className="App">
      <input
        ref={inputRef}
        value={text}
        onInput={onInput}
        style={{ width: "500px" }}
      />
      {show &&
        participant
          .filter(
            (item) => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1
          )
          .map((item) => (
            <div
              key={item.id}
              onClick={() => onClick(item.name)}
              style={{ cursor: "pointer" }}
            >
              {item.name}
            </div>
          ))}
      <button onClick={submit}>отправить</button>

      {message.map((item) => (
        <div
          dangerouslySetInnerHTML={{ __html: replaceStr(item.text) }}
          key={item.id}
        />
      ))}
    </div>
  );
}

export default App;
