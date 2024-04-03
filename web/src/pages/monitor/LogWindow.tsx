import { useEffect, useRef, useState } from "preact/hooks";
import { getLogs } from "../../util/docker";

import "./LogWindow.css";

interface Props {
  id: string;
}

export function LogWindow(props: Props) {
  const [logs, setLogs] = useState("");
  const [manuallyScrolled, setManuallyScrolled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // TODO maybe do with websockets?
    const intv = setInterval(async () => {
      const req = await getLogs(props.id);

      setLogs(req.message);

      console.log(manuallyScrolled);

      if (!manuallyScrolled) {
        // Autoscroll
        ref.current.scrollTo(0, ref.current.scrollHeight);
      }
    }, 1000);

    return () => clearInterval(intv);
  }, []);

  return (
    <div class="log-window" ref={ref}>
      <pre
        onScroll={() => {
          setManuallyScrolled(true);
        }}
        onScrollEnd={() => {
          setManuallyScrolled(false);
        }}
      >
        {logs}
      </pre>
    </div>
  );
}
