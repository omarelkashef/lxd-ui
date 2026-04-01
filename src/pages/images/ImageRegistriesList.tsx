import { useState, useEffect, type FC } from "react";
import {
  EmptyState,
  Icon,
  List,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import useSortTableData from "util/useSortTableData";
import { useImageRegistries } from "context/useImageRegistries";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import PageHeader from "components/PageHeader";
import { useServerEntitlements } from "util/entitlements/server";
import ImageRegistriesSearchFilter, {
  type ImageRegistryFilter,
} from "./ImageRegistriesSearchFilter";
import { useSearchParams } from "react-router-dom";
import type { LxdImageRegistryProtocol } from "types/image";
import { isRegistryPublic } from "util/image-registries";
import { CreateImageRegistryButton } from "./actions/CreateImageRegistryButton";

const ImageRegistriesList: FC = () => {
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [searchParams] = useSearchParams();

  const { canCreateImageRegistries } = useServerEntitlements();

  const { data: imageRegistries = [], error, isLoading } = useImageRegistries();

  if (error) {
    notify.failure("Loading image registries failed", error);
  }

  useEffect(() => {
    const validNames = new Set(imageRegistries?.map((image) => image.name));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [imageRegistries]);

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description" },
    {
      content: "Protocol",
      sortKey: "protocol",
    },
    {
      content: "Built-in",
      sortKey: "builtin",
    },
    {
      content: "Public",
      sortKey: "public",
    },
    { "aria-label": "Actions", className: "actions" },
  ];

  const filters: ImageRegistryFilter = {
    queries: searchParams.getAll("query").map((value) => value.toLowerCase()),
    protocol: searchParams.getAll("protocol") as LxdImageRegistryProtocol[],
    builtin: searchParams
      .getAll("builtin")
      .map((value) => value.toLowerCase() === "yes"),
    public: searchParams
      .getAll("public")
      .map((value) => value.toLowerCase() === "yes"),
  };

  const filteredImageRegistries = imageRegistries.filter(
    (item) =>
      (!filters.queries.length ||
        filters.queries.some(
          (query) =>
            (item?.description ?? "").toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query),
        )) &&
      (!filters.protocol.length || filters.protocol.includes(item.protocol)) &&
      (!filters.builtin.length || filters.builtin.includes(item.builtin)) &&
      (!filters.public.length ||
        filters.public.includes(isRegistryPublic(item))),
  );

  const selectedImageRegistries = imageRegistries.filter((registry) =>
    selectedNames.includes(registry.name),
  );

  const rows = filteredImageRegistries.map((registry) => {
    const actions = (
      <List inline className="actions-list u-no-margin--bottom" items={[]} />
    );

    return {
      key: registry.name,
      name: registry.name,
      columns: [
        {
          content: registry.name,
          role: "rowheader",
          "aria-label": "Name",
          title: `Image registry ${registry.name}`,
          className: "clickable-cell",
        },
        {
          content: (
            <div className="u-truncate" title={registry.description}>
              {registry.description}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
          className: "clickable-cell",
        },
        {
          content: registry.protocol,
          role: "cell",
          "aria-label": "Protocol",
          className: "clickable-cell",
        },
        {
          content: registry.builtin ? "Yes" : "No",
          role: "cell",
          "aria-label": "Built-in",
          className: "clickable-cell",
        },
        {
          content: isRegistryPublic(registry) ? "Yes" : "No",
          role: "cell",
          "aria-label": "Public",
          className: "clickable-cell",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: registry.name.toLowerCase(),
        description: registry.description.toLowerCase(),
        protocol: registry.protocol.toLowerCase(),
        builtin: registry.builtin,
      },
    };
  });
  const { rows: sortedRows, updateSort } = useSortTableData({ rows });
  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    // This is needed because TablePagination does not cater for plural identity
    const defaultPaginationDescription =
      rows.length > 1
        ? `Showing all ${rows.length} registries`
        : `Showing 1 out of 1 registry`;

    if (selectedImageRegistries.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={filteredImageRegistries.length ?? 0}
          itemName="registry"
          selectedNames={selectedNames}
          setSelectedNames={setSelectedNames}
          filteredNames={filteredImageRegistries.map((item) => item.name)}
        />
      );
    }

    return defaultPaginationDescription;
  };

  return (
    <>
      <CustomLayout
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/image-handling/"
                  title="Learn more about image registries"
                >
                  Image registries
                </HelpLink>
              </PageHeader.Title>
              {selectedNames.length === 0 && imageRegistries.length > 0 && (
                <PageHeader.Search>
                  <ImageRegistriesSearchFilter />
                </PageHeader.Search>
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <CreateImageRegistryButton />
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row>
          {imageRegistries.length === 0 && (
            <EmptyState
              className="empty-state"
              image={<Icon name="image" className="empty-state-icon" />}
              title="No image registries found"
            >
              <p>
                There are no image registries.
                {canCreateImageRegistries()
                  ? " Create your first image registry!"
                  : ""}
              </p>
            </EmptyState>
          )}
          {imageRegistries.length > 0 && (
            <ScrollableTable
              dependencies={[imageRegistries]}
              tableId="image-registries-table"
              belowIds={["status-bar"]}
            >
              <TablePagination
                data={sortedRows}
                id="pagination"
                className="u-no-margin--top"
                itemName="registry"
                aria-label="Table pagination control"
                description={getTablePaginationDescription()}
              >
                <SelectableMainTable
                  id="image-registries-table"
                  headers={headers}
                  sortable
                  className="image-registries-table"
                  defaultSortKey="name"
                  emptyStateMsg="No image registries found matching this search"
                  onUpdateSort={updateSort}
                  selectedNames={selectedNames}
                  setSelectedNames={setSelectedNames}
                  itemName="image registry"
                  parentName=""
                  filteredNames={filteredImageRegistries.map(
                    (item) => item.name,
                  )}
                  disabledNames={[]}
                  rows={sortedRows}
                />
              </TablePagination>
            </ScrollableTable>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default ImageRegistriesList;
