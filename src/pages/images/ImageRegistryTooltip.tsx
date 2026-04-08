import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import { RichTooltipTable } from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { Link } from "react-router";
import { useImageRegistry } from "context/useImages";
import { isImageRegistryPublic } from "util/image-registries";
import ItemName from "components/ItemName";

interface Props {
  imageRegistryName: string;
  imageRegistryUrl: string;
}

const ImageRegistryRichTooltip: FC<Props> = ({
  imageRegistryName,
  imageRegistryUrl,
}) => {
  const { data: imageRegistry, isLoading: isLoading } =
    useImageRegistry(imageRegistryName);

  if (!imageRegistry && !isLoading) {
    return (
      <>
        Image registry{" "}
        <ResourceLabel type="image-registry" value={imageRegistryName} bold />{" "}
        not found
      </>
    );
  }

  const description = imageRegistry?.description || "-";
  const protcol = imageRegistry?.protocol;
  const isPublic = !imageRegistry || isImageRegistryPublic(imageRegistry);

  const rows: TooltipRow[] = [
    {
      title: "Image Registry",
      value: imageRegistry ? (
        <Link
          to={imageRegistryUrl}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ItemName item={{ name: imageRegistryName }} />
        </Link>
      ) : (
        <Spinner />
      ),
      valueTitle: imageRegistryName,
    },
    {
      title: "Description",
      value: description,
      valueTitle: description,
    },
    {
      title: "Protocol",
      value: protcol || "-",
    },
    {
      title: "Public",
      value: isPublic ? "Yes" : "No",
    },
    { title: "Built-in", value: imageRegistry?.builtin ? "Yes" : "No" },
    {
      title: "URL",
      value: imageRegistry?.config?.url || "-",
    },
  ];

  if (!isPublic) {
    rows.push({
      title: "Cluster",
      value: imageRegistry?.config?.cluster || "-",
    });
  }

  if (!isPublic && protcol === "lxd") {
    rows.push({
      title: "Source Project",
      value: imageRegistry?.config?.source_project || "-",
    });
  }

  return (
    <RichTooltipTable
      rows={rows}
      className="image-registry-rich-tooltip-table"
    />
  );
};

export default ImageRegistryRichTooltip;
