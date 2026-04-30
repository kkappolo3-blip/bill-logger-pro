import { useState } from "react";

export function Calculator() {
  const [display, setDisplay] = useState("0");

  const append = (val: string) => setDisplay((d) => (d === "0" && val !== "." ? val : d + val));
  const clear = () => setDisplay("0");
  const del = () => setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
  const calculate = () => {
    try {
      const result = new Function("return " + display)();
      setDisplay(String(result));
    } catch {
      setDisplay("Error");
    }
  };

  const numBtn = "p-2 rounded-lg font-medium bg-calc-button text-primary-foreground hover:opacity-80 transition-opacity";
  const opBtn = "p-2 rounded-lg font-bold bg-primary/20 text-primary transition-opacity hover:opacity-80";

  return (
    <div className="bg-calc-bg p-4 rounded-2xl shadow-inner">
      <input readOnly value={display} className="w-full text-right bg-transparent border-none text-xl font-mono font-bold text-calc-display focus:outline-none mb-3" />
      <div className="grid grid-cols-4 gap-2">
        <button onClick={clear} className="col-span-2 p-2 bg-destructive/20 text-destructive font-bold rounded-lg hover:opacity-80">C</button>
        <button onClick={del} className={numBtn}>←</button>
        <button onClick={() => append("/")} className={opBtn}>/</button>
        {["7","8","9"].map((n) => <button key={n} onClick={() => append(n)} className={numBtn}>{n}</button>)}
        <button onClick={() => append("*")} className={opBtn}>*</button>
        {["4","5","6"].map((n) => <button key={n} onClick={() => append(n)} className={numBtn}>{n}</button>)}
        <button onClick={() => append("-")} className={opBtn}>-</button>
        {["1","2","3"].map((n) => <button key={n} onClick={() => append(n)} className={numBtn}>{n}</button>)}
        <button onClick={() => append("+")} className={opBtn}>+</button>
        <button onClick={() => append("0")} className={`col-span-2 ${numBtn}`}>0</button>
        <button onClick={() => append(".")} className={numBtn}>.</button>
        <button onClick={calculate} className="p-2 bg-success text-success-foreground font-bold rounded-lg hover:opacity-80">=</button>
      </div>
    </div>
  );
}
