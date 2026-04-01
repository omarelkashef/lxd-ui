import type { FC } from "react";
import { useServerEntitlements } from "util/entitlements/server";
import { Button, Icon } from "@canonical/react-components";

export const CreateImageRegistryButton: FC = () => {
  const { canCreateImageRegistries } = useServerEntitlements();
  return (
    <Button
      name="Create registry"
      disabled={!canCreateImageRegistries()}
      hasIcon
      appearance="positive"
      className="u-float-right u-no-margin--bottom"
      title="Create registry"
    >
      <Icon name="plus" className="u-margin--right" />
      <span> Create registry</span>
    </Button>
  );
};
