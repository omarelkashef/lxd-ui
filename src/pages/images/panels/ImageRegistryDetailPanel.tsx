import type { FC } from "react";
import {
  Button,
  Icon,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

import { useImageRegistry } from "context/useImages";

const ImageRegistryDetailPanel: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const isEnabled = panelParams.imageRegistry !== null;
  const {
    data: imageRegistry,
    error,
    isLoading,
  } = useImageRegistry(panelParams.imageRegistry ?? "", isEnabled);

  if (error) {
    notify.failure("Loading image registry failed", error);
  }

  return (
    <SidePanel
      loading={isLoading}
      hasError={!imageRegistry}
      className="u-hide--medium u-hide--small detail-panel image-registry-detail-panel"
      pinned
      width="narrow"
    >
      <SidePanel.Sticky>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Image registry summary</SidePanel.HeaderTitle>
          <SidePanel.HeaderControls>
            <Button
              appearance="base"
              className="u-no-margin--bottom"
              hasIcon
              onClick={panelParams.clear}
              aria-label="Close"
            >
              <Icon name="close" />
            </Button>
          </SidePanel.HeaderControls>
        </SidePanel.Header>
      </SidePanel.Sticky>
      <SidePanel.Content>
        {imageRegistry && (
          <table className="u-table-layout--auto u-no-margin--bottom">
            <tbody>
              <tr>
                <th className="u-text--muted">Name</th>
                <td>{imageRegistry.name}</td>
              </tr>
              <tr>
                <th className="u-text--muted u-truncate">Description</th>
                <td>{imageRegistry.description || "-"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Protocol</th>
                <td>{imageRegistry.protocol}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Built-in</th>
                <td>{imageRegistry.builtin ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th className="u-text--muted">Public</th>
                <td>
                  {imageRegistry?.config?.public === "true" ? "Yes" : "No"}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted u-truncate">URL</th>
                <td title={imageRegistry.config?.url}>
                  {imageRegistry.config?.url ?? "-"}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted u-truncate">Cluster</th>
                <td title={imageRegistry.config?.cluster}>
                  {imageRegistry.config?.cluster ?? "-"}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted u-truncate">Source Project</th>
                <td title={imageRegistry.config?.source_project}>
                  {imageRegistry.config?.source_project ?? "-"}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </SidePanel.Content>
    </SidePanel>
  );
};

export default ImageRegistryDetailPanel;
