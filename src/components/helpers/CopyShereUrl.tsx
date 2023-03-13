import { useState } from "react";
import { Button } from "./Button";
import { TextField } from "./TextField";

type CopyShareUrlProps = {
  url: string;
};

export const CopyShareUrl = ({ url }: CopyShareUrlProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setInterval(() => {
      setIsCopied(false);
    }, 2000);
  };
  return (
    <div>
      <div
        css={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TextField
          type="url"
          readOnly
          value={url}
          fullWidth
          onFocus={(e) => e.target.select()}
        />
        <Button onClick={copy} outlined>
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p css={{ fontWeight: 500, color: "mediumvioletred" }}>
        Share this link to play with other users!
      </p>
    </div>
  );
};
