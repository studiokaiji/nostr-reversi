type DiscProps = {
  isDisplayBorder?: boolean;
  color: "b" | "w";
};

export const Disc = ({ isDisplayBorder, color }: DiscProps) => {
  return (
    <div
      css={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: isDisplayBorder ? "1.5px solid black" : "",
        backgroundColor: color === "b" ? "black" : "white",
      }}
    />
  );
};
