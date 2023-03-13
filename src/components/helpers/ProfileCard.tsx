import { Disc } from "./Disc";
import Skeleton from "react-loading-skeleton";

type ProfileCardProps = {
  disc?: Disc;
  profile: Profile;
  npub: string;
  numberOfDisc: number;
};

export const ProfileCard = ({
  disc,
  profile,
  npub,
  numberOfDisc,
}: ProfileCardProps) => (
  <a
    css={{
      boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      padding: "12px",
      display: "flex",
      gap: "7px",
      alignItems: "center",
      ":hover": {
        opacity: 1,
      },
      borderRadius: "3px",
    }}
    href={`https://iris.to/${npub}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {disc && <Disc color={disc} isDisplayBorder />}
    {profile?.picture ? (
      <img
        src={profile?.picture}
        width={42}
        height={42}
        css={{ borderRadius: "2px" }}
      />
    ) : (
      <Skeleton width={42} height={42} borderRadius="2px" />
    )}
    <div css={{ color: "black" }}>{numberOfDisc}</div>
  </a>
);
