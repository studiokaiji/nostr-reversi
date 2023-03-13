import { Disc } from "./Disc";
import Skeleton from "react-loading-skeleton";
import { Card } from "./Card";

type ProfileCardProps = {
  disc?: Disc;
  profile: Profile;
  npub: string;
  numberOfDisc?: number;
};

export const ProfileCard = ({
  disc,
  profile,
  npub,
  numberOfDisc,
}: ProfileCardProps) => (
  <a
    css={{
      ":hover": {
        opacity: 1,
      },
    }}
    href={`https://iris.to/${npub}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Card>
      {disc && <Disc color={disc} isDisplayBorder />}
      {profile ? (
        <img
          src={profile?.picture || ""}
          width={42}
          height={42}
          css={{ borderRadius: "2px" }}
        />
      ) : (
        <Skeleton width={42} height={42} borderRadius="2px" />
      )}
      {numberOfDisc && <div css={{ color: "black" }}>{numberOfDisc}</div>}
    </Card>
  </a>
);
