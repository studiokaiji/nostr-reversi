export const TextField = (
  props: JSX.IntrinsicElements["input"] & { fullWidth?: boolean }
) => {
  return (
    <input
      {...props}
      css={{
        border: "2px solid gray",
        outline: "none",
        appearance: "none",
        MozAppearance: "none",
        WebkitAppearance: "none",
        padding: "0.7rem",
        fontSize: "1rem",
        width: props.fullWidth ? "100%" : "auto",
      }}
    />
  );
};
